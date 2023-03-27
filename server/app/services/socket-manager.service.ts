/* eslint-disable max-lines */
import { Command } from '@app/interfaces/command';
import { Game } from '@app/interfaces/game';
import { Letter } from '@app/interfaces/lettre';
import { Placement } from '@app/interfaces/placement';
// import { JoinInfos } from '@app/interfaces/join-infos';
// import { ScrabbleClassic } from '@app/classes/scrabble-classic';
// import { ScrabbleClassicSolo } from '@app/classes/scrabble-classic-solo';
// import { SocketUser } from '@app/interfaces/socket-user';
// import { SoloGame } from '@app/interfaces/solo-game';
import { WordArgs } from '@app/interfaces/word-args';
import { COLUMNS_LETTERS } from '@app/constants/constants';
import * as http from 'http';
import * as io from 'socket.io';
import { GameManager } from './game-manager.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { LoginService } from './login.service';
import { DatabaseService } from './database.service';
import { ChatMessage } from '@app/interfaces/chat-message';
import { PlayerInfos } from '@app/interfaces/player-infos';
import { ChannelService } from './channels.service';
import { ScrabbleClassicMode } from '@app/classes/scrabble-classic-mode';
import { ScrabbleCooperativeMode } from '@app/classes/scrabble-cooperative-mode';
import { CooperativeAction } from '@app/interfaces/cooperative-action';
import { iconService } from './icon.service';

export class SocketManager {
    private sio: io.Server;
    // private roomIncrement = 1;
    // private roomName: string;
    private usernames = new Map<string, string>(); // socket id - username;
    private gameRooms = new Map<string, Game>(); // roomname - game
    private scrabbleGames = new Map<string, ScrabbleClassicMode>(); // roomname - game
    private scrabbleCooperativeGames = new Map<string, ScrabbleCooperativeMode>(); // roomname - game
    private usersRoom = new Map<string, string>(); // socket id - game room
    // private disconnectedSocket: SocketUser = { oldSocketId: '', newSocketId: '' };
    private gameManager: GameManager;
    private loginService: LoginService;
    private channelService: ChannelService;
    private iconService: iconService;

    constructor(server: http.Server, private databaseService: DatabaseService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        // this.roomName = 'room' + this.roomIncrement;

        this.loginService = new LoginService(this.databaseService, this.channelService);
        this.channelService = new ChannelService(this.databaseService);
        this.iconService = new iconService(this.databaseService);
        this.gameManager = new GameManager(
            this.sio,
            this.usernames,
            this.usersRoom,
            this.gameRooms,
            this.scrabbleGames,
            this.scrabbleCooperativeGames,
        );
    }
    // changeRoomName() {
    //     this.roomIncrement++;
    //     this.roomName = 'room' + this.roomIncrement;
    // }
    createGame(game: Game, socketId: string) {
        game.room = `Partie de ${game.hostUsername}`;
        this.gameRooms.set(game.room, game);
        game.hostID = socketId;
        this.usersRoom.set(socketId, game.room);
    }
    gameList(isClassic: boolean): Game[] {
        return Array.from(this.gameRooms.values()).filter((game: Game) => {
            const classic = game.isClassicMode === isClassic && !game.isFinished;
            const privateFull = classic && game.isPrivate && !game.isFullPlayers;
            return !game.isPrivate ? classic : privateFull;
        });
    }
    gameCreationHandler(socket: io.Socket) {
        socket.on('create-game', async (game: Game) => {
            game.joinedPlayers = typeof game.joinedPlayers === 'string' ? JSON.parse(game.joinedPlayers) : game.joinedPlayers;
            game.joinedObservers = typeof game.joinedObservers === 'string' ? JSON.parse(game.joinedObservers) : game.joinedObservers;
            this.createGame(game, socket.id);
            // TODO remettre createChannel
            // await this.createChannel(socket, game.room, true);
            socket.join(game.room);
            game.joinedPlayers.push({ username: game.hostUsername, socketId: socket.id });
            this.sio.to(game.room).emit('create-game', game);
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });

        socket.on('dictionary-selected', (dictionary: Dictionary) => {
            this.sio.emit('dictionary-selected', dictionary);
        });
    }
    waitingRoomHostHandler(socket: io.Socket) {
        socket.on('cancel-match', async () => {
            const gameCanceled = this.gameRooms.get(this.usersRoom.get(socket.id) as string) as Game;
            this.gameManager.leaveRoom(socket.id);
            socket.leave(gameCanceled.room);
            this.sio.to(gameCanceled.room).emit('cancel-match');
            for (const player of gameCanceled.joinedPlayers) {
                this.sio.sockets.sockets.get(player.socketId)?.leave(gameCanceled.room);
                await this.leaveChannelWithSocketId(player.socketId, gameCanceled.room);
            }
            for (const observer of gameCanceled.joinedObservers) {
                this.sio.sockets.sockets.get(observer.socketId)?.leave(gameCanceled.room);
                await this.leaveChannelWithSocketId(observer.socketId, gameCanceled.room);
            }
            this.gameRooms.delete(gameCanceled.room);
            this.sio.emit('update-joinable-matches', this.gameList(gameCanceled.isClassicMode));
            await this.deleteChannel(gameCanceled.room);
        });
    }
    waitingRoomJoinedPlayerHandler(socket: io.Socket) {
        socket.on('joined-user-left', async (isObserver: boolean) => {
            const playerUsername = this.usernames.get(socket.id) as string;
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            await this.leaveChannel(socket, game.room);
            this.gameManager.leaveRoom(socket.id);
            if (!isObserver) {
                game.joinedPlayers = game.joinedPlayers.filter((user) => user.username !== playerUsername);
                game.isFullPlayers = game.joinedPlayers.length === game.humanPlayers;
                this.sio.to(room).emit('joined-user-left', playerUsername);
            } else {
                game.joinedObservers = game.joinedObservers.filter((user) => user.username !== playerUsername);
                this.sio.to(room).emit('joined-observer-left', playerUsername);
            }
            this.sio.to(room).emit('waiting-room-player', game);
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });
        socket.on('waiting-room-player', async (gameParams: Game) => {
            const roomToJoin = gameParams.room;
            await this.joinChannels(socket, [roomToJoin]);
            this.usersRoom.set(socket.id, roomToJoin);
            const playerUsername = this.usernames.get(socket.id) as string;
            const game = this.gameRooms.get(roomToJoin) as Game;
            if (game.password) game.playersWaiting--;
            game.joinedPlayers.push({ username: playerUsername, socketId: socket.id });
            game.isFullPlayers = game.joinedPlayers.length === game.humanPlayers;
            this.sio.to(socket.id).emit('waiting-player-status', false); // isObserver
            this.sio.to(roomToJoin).emit('waiting-room-player', game);
            this.sio.emit('update-joinable-matches', this.gameList(gameParams.isClassicMode));
        });
        socket.on('waiting-room-observer', async (gameParams: Game) => {
            const roomToJoin = gameParams.room;
            await this.joinChannels(socket, [roomToJoin]);
            this.usersRoom.set(socket.id, roomToJoin);
            const playerUsername = this.usernames.get(socket.id) as string;
            const game = this.gameRooms.get(roomToJoin) as Game;
            game.joinedObservers.push({ username: playerUsername, socketId: socket.id });
            this.sio.to(socket.id).emit('waiting-player-status', true);
            this.sio.to(roomToJoin).emit('waiting-room-player', game);
            this.sio.emit('update-joinable-matches', this.gameList(gameParams.isClassicMode));
        });
        // Partie protégé par mot de passe
        socket.on('waiting-password-game', (gameParams: Game) => {
            const game = this.gameRooms.get(gameParams.room) as Game;
            game.playersWaiting++;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });
        socket.on('cancel-waiting-password', (gameParams: Game) => {
            const game = this.gameRooms.get(gameParams.room) as Game;
            game.playersWaiting--;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });
        // Rejoindre une partie privée
        socket.on('private-room-player', (gameParams: Game) => {
            const playerUsername = this.usernames.get(socket.id) as string;
            this.sio.to(gameParams.hostID).emit('private-room-player', { username: playerUsername, socketId: socket.id });
            const game = this.gameRooms.get(gameParams.room) as Game;
            game.playersWaiting++;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });

        socket.on('accept-private-player', (userInfos: PlayerInfos) => {
            this.sio.to(userInfos.socketId).emit('accept-private-player');
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            game.playersWaiting--;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });

        socket.on('reject-private-player', (userInfos: PlayerInfos) => {
            this.sio.to(userInfos.socketId).emit('reject-private-player');
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            game.playersWaiting--;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });

        socket.on('left-private-player', (gameParams: Game) => {
            const username = this.usernames.get(socket.id);
            this.sio.to(gameParams.hostID).emit('left-private-player', username);
            const game = this.gameRooms.get(gameParams.room) as Game;
            game.playersWaiting--;
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });
    }
    gameRoomsViewHandler(socket: io.Socket) {
        socket.on('update-joinable-matches', (isClassicMode: boolean) => {
            this.sio.emit('update-joinable-matches', this.gameList(isClassicMode));
        });
        socket.on('sendUsername', () => {
            const myUsername = this.usernames.get(socket.id) as string;
            this.sio.to(socket.id).emit('sendUsername', myUsername);
        });
    }
    startClassicGame(room: string, game: Game) {
        const scrabbleGame = this.scrabbleGames.get(room) as ScrabbleClassicMode;
        const data = { players: scrabbleGame.getPlayersInfo(), turnSocket: scrabbleGame.socketTurn };
        this.sio.to(room).emit('send-game-timer', game.time);
        this.sio.to(room).emit('user-turn', this.scrabbleGames.get(room)?.socketTurn);
        this.sio.to(room).emit('send-info-to-panel', data);
        // Si jamais un des joueur virtuel est le premier joueur a jouer
        const socketTurn = this.scrabbleGames.get(game.room)?.socketTurn as string;
        if (scrabbleGame.virtualNames.includes(socketTurn)) {
            this.gameManager.virtualPlayerPlay(game.room);
        }
    }
    startCooperativeGame(room: string) {
        const scrabbleGame = this.scrabbleCooperativeGames.get(room) as ScrabbleCooperativeMode;
        const data = { players: scrabbleGame.getPlayersInfo(), turnSocket: '' };
        this.sio.to(room).emit('send-info-to-panel', data);
    }
    joinGameHandler(socket: io.Socket) {
        socket.on('join-game', (isLightClient: boolean) => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            const playerSockets: string[] = [];
            const virtualPlayers: string[] = [];
            const playersUsernames = new Map<string, string>(); // socket id - username des joueurs
            for (const player of game.joinedPlayers) {
                playerSockets.push(player.socketId);
                playersUsernames.set(player.socketId, player.username);
            }
            for (let i = 0; i < game.virtualPlayers; i++) {
                const botName = `Bot ${i + 1}`;
                virtualPlayers.push(`Bot ${i + 1}`);
                playersUsernames.set(botName, botName);
            }
            // TODO ajouter les observateurs
            // for(const player of game.joinedPlayers) playerSockets.push(player.socketId);
            if (game.isClassicMode) {
                this.scrabbleGames.set(room, new ScrabbleClassicMode(playerSockets, virtualPlayers, playersUsernames, game.dictionary.fileName));
                this.sio.to(room).emit('join-game');
                if (!isLightClient) this.startClassicGame(room, game);
            } else {
                this.scrabbleCooperativeGames.set(room, new ScrabbleCooperativeMode(playerSockets, playersUsernames, game.dictionary.fileName));
                this.sio.to(room).emit('join-game');
                if (!isLightClient) this.startCooperativeGame(room);
            }
        });
        socket.on('start-game-light-client', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            if (game.isClassicMode) this.startClassicGame(room, game);
            else this.startCooperativeGame(room);
        });
    }
    cooperativeModeHandler(socket: io.Socket) {
        socket.on('vote-action', (action: CooperativeAction) => {
            const room = this.usersRoom.get(socket.id) as string;
            console.log('received vote-action');
            console.log(action);
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            for (let socket of scrabbleGame.getPlayersSockets()) {
                if (!action.socketAndChoice[socket]) {
                    action.socketAndChoice[socket] = 'choice';
                }
            }
            (scrabbleGame as ScrabbleCooperativeMode).setCooperativeAction(action);
            if (action.action === 'place')
                (action.placement as Placement).command = (scrabbleGame as ScrabbleCooperativeMode).getPlacementWord(
                    (action.placement as Placement).letters,
                );
            this.sio.to(room).emit('vote-action', action);
        });
        socket.on('player-vote', (playerAccept: boolean) => {
            // recevoir le vote d'une personne et le propager pour le reste
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const coopAction: CooperativeAction = (scrabbleGame as ScrabbleCooperativeMode).getCooperativeAction();
            if (playerAccept) {
                coopAction.votesFor++;
                coopAction.socketAndChoice[socket.id] = 'yes';
            } else {
                coopAction.votesAgainst++;
                coopAction.socketAndChoice[socket.id] = 'no';
            }
            if (coopAction.votesFor + coopAction.votesAgainst === scrabbleGame.humansPlayerInGame) {
                if (coopAction.votesFor > coopAction.votesAgainst) this.sio.to(room).emit('accept-action', coopAction);
                else this.sio.to(room).emit('reject-action', coopAction);
            } else {
                this.sio.to(room).emit('update-vote-action', coopAction);
            }
        });
    }
    helpCommandHandler(socket: io.Socket) {
        socket.on('reserve-command', () => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const reserveResult: Command = scrabbleGame.reserveState();
            this.sio.to(socket.id).emit('reserve-command', reserveResult);
        });
        socket.on('hint-command', () => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const hintWords: string = scrabbleGame.getPlayerHintWords(socket.id);
            this.sio.to(socket.id).emit('chatMessage', {
                username: '',
                message: hintWords,
                time: new Date().toTimeString().split(' ')[0],
                type: 'system',
                channel: this.usersRoom.get(socket.id) as string,
            });
        });
    }
    exchangeCommandHandler(socket: io.Socket) {
        socket.on('exchange-command', (letters: string) => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const exchangeResult: Command = scrabbleGame.exchangeLetters(letters);
            this.sio.to(socket.id).emit('exchange-command', exchangeResult);
        });
        socket.on('exchange-opponent-message', (numberLetters: number) => {
            const username = this.usernames.get(socket.id);
            for (const opponentSocket of this.gameManager.findOpponentSockets(socket.id))
                this.sio.to(opponentSocket).emit('chatMessage', {
                    username: username,
                    message: `!échanger ${numberLetters} lettre(s)`,
                    time: new Date().toTimeString().split(' ')[0],
                    type: 'player',
                    channel: this.usersRoom.get(socket.id) as string,
                });
        });
    }
    passCommandHandler(socket: io.Socket) {
        socket.on('pass-turn', () => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            scrabbleGame.incrementStreakPass();
            this.gameManager.isEndGame(this.usersRoom.get(socket.id) as string, scrabbleGame);
        });
    }
    chatHandler(socket: io.Socket) {
        socket.on('chatMessage', (message: ChatMessage) => {
            //const room = this.usersRoom.get(socket.id) as string;
            //const username = this.usernames.get(socket.id);
            //this.sio.to(room).emit('chatMessage', { type: 'player', message: `${username} : ${message}` });
            // eslint-disable-next-line no-console
            this.sio.to(message.channel as string).emit('chatMessage', message);
            this.channelService.addMessageToChannel(message);
        });
    }
    placeCommandViewHandler(socket: io.Socket) {
        socket.on('remove-arrow-and-letter', () => {
            this.sio.to(socket.id).emit('remove-arrow-and-letter');
        });
        socket.on('draw-letters-rack', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            if (scrabbleGame.isClassicMode) this.sio.to(socket.id).emit('draw-letters-rack', scrabbleGame.getPlayerRack(socket.id));
            else this.sio.to(room).emit('draw-letters-rack', scrabbleGame.getPlayerRack(socket.id));
        });
        socket.on('remove-letters-rack', (letters) => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            // letters = (typeof letters === "string") ? JSON.parse(letters as unknown as string): letters;
            const playerRackLettersRemoved = scrabbleGame.removeLettersRackForValidation(socket.id, letters) as string[];
            this.sio.to(socket.id).emit('draw-letters-rack', playerRackLettersRemoved);
        });

        socket.on('remove-letters-rack-light-client', (letters) => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            letters = JSON.parse(letters as unknown as string);
            scrabbleGame.removeLettersRackForValidation(socket.id, letters) as string[];
            // this.sio.to(socket.id).emit('draw-letters-rack', playerRackLettersRemoved);
        });
        socket.on('freeze-timer', () => {
            const room = this.usersRoom.get(socket.id) as string;
            this.sio.to(room).emit('freeze-timer');
        });
        socket.on('update-reserve', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const reserveLength: number = scrabbleGame.getReserveLettersLength();
            this.sio.to(room).emit('update-reserve', reserveLength);
        });

        socket.on('draw-letters-opponent', (lettersPosition) => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            // Client lourd envoie la liste de lettres mais client léger envoie tout l'objet {letters, point}
            const lettersPositionTransformed = Array.isArray(lettersPosition) ? lettersPosition : lettersPosition.letters;
            if (game.isClassicMode) {
                for (const opponentSocket of this.gameManager.findOpponentSockets(socket.id))
                    this.sio.to(opponentSocket).emit('draw-letters-opponent', lettersPositionTransformed);
            } else {
                this.sio.to(room).emit('draw-letters-opponent', lettersPositionTransformed);
            }
        });
    }
    placeCommandHandler(socket: io.Socket) {
        socket.on('verify-place-message', (command: WordArgs) => {
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const lettersPosition = scrabbleGame.verifyPlaceCommand(command.line, command.column, command.value, command.orientation);
            const writtenCommand = '!placer ' + COLUMNS_LETTERS[command.line] + (command.column + 1) + command.orientation + ' ' + command.value;

            this.sio.to(socket.id).emit('verify-place-message', {
                letters: lettersPosition as string | Letter[],
                command: writtenCommand,
            } as Placement);
        });
        socket.on('validate-created-words', (lettersPlaced: Placement) => {
            const room = this.usersRoom.get(socket.id) as string;
            // const opponentSocket = this.gameManager.findOpponentSocket(socket.id);
            const username = this.usernames.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const score = scrabbleGame.validateCalculateWordsPoints(lettersPlaced.letters);
            this.sio.to(socket.id).emit('validate-created-words', { letters: lettersPlaced.letters, points: score });
            if (score !== 0) {
                this.sio.to(room).emit('chatMessage', {
                    username: username,
                    message: lettersPlaced.command,
                    time: new Date().toTimeString().split(' ')[0],
                    type: 'player',
                    channel: this.usersRoom.get(socket.id) as string,
                });
                this.gameManager.isEndGame(room, scrabbleGame);
            }
        });
        socket.on('cooperative-invalid-action', (isPlacement: boolean) => {
            // envoyer a toutes les autres personnes le message d erreur de l'action
            for (const opponentSocket of this.gameManager.findOpponentSockets(socket.id))
                this.sio.to(opponentSocket).emit('cooperative-invalid-action', isPlacement);
        });
    }
    playerScoreHandler(socket: io.Socket) {
        socket.on('send-player-score', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            const data = { players: scrabbleGame.getPlayersInfo(), turnSocket: scrabbleGame.socketTurn };
            this.sio.to(room).emit('send-info-to-panel', data);
        });
    }
    gameTurnHandler(socket: io.Socket) {
        socket.on('change-user-turn', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            if (!scrabbleGame.isEndGame) {
                if (scrabbleGame.isClassicMode) this.gameManager.changeTurn(room);
                else this.sio.to(room).emit('user-turn', scrabbleGame.socketTurn);
            }
        });
        socket.on('user-turn', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const scrabbleGame = this.gameManager.getScrabbleGame(socket.id);
            this.sio.to(room).emit('user-turn', scrabbleGame.socketTurn);
        });
    }
    endGameHandler(socket: io.Socket) {
        socket.on('abandon-game', async () => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            socket.leave(room);
            await this.leaveChannel(socket, room);
            if (game.isClassicMode) this.gameManager.abandonClassicGame(socket.id);
            else this.gameManager.abandonCooperativeGame(socket.id);
        });
        socket.on('quit-game', async () => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            await this.leaveChannel(socket, game.room);
            this.sio.to(room).emit('chatMessage', {
                username: '',
                message: `${this.usernames.get(socket.id)} a quitté le jeu.`,
                time: new Date().toTimeString().split(' ')[0],
                type: 'system',
                channel: this.usersRoom.get(socket.id) as string,
            });
            this.gameManager.leaveRoom(socket.id);
            socket.disconnect();
        });
    }

    userConnectionHandler(socket: io.Socket) {
        socket.on('user-connection', (loginInfos) => {
            this.usernames.set(loginInfos.socketId, loginInfos.username);
            this.userJoinChannels(socket);
            // this.loginService.changeConnectionState(loginInfos.username, true);
        });
    }

    userDisconnectHandler(socket: io.Socket) {
        socket.on('user-disconnect', (socketId: string) => {
            const username = this.usernames.get(socketId);
            if (username) {
                this.usernames.delete(socketId);
                this.loginService.changeConnectionState(username, false);
            }
        });
    }

    async userJoinChannels(socket: io.Socket) {
        const username = this.usernames.get(socket.id);
        if (username) {
            const channels = await this.channelService.getUserChannelsName(username);
            for (const channel of channels) {
                socket.join(channel);
            }
        }
    }

    async joinChannels(socket: io.Socket, channelNames: string[]) {
        const username = this.usernames.get(socket.id);
        await this.channelService.joinExistingChannels(Array.isArray(channelNames) ? channelNames : [channelNames], username as string);
        if (Array.isArray(channelNames)) {
            for (const channel of channelNames) {
                socket.join(channel);
            }
        } else {
            socket.join(channelNames);
        }
        this.sio.to(socket.id).emit('channels-joined');
    }

    async userJoinNewChannels(socket: io.Socket) {
        socket.on('join-channel', async (channelNames: string[]) => {
            await this.joinChannels(socket, channelNames);
        });
    }

    async createChannel(socket: io.Socket, channelName: string, isGameChannel: boolean) {
        const username = this.usernames.get(socket.id);
        const channel = await this.channelService.createNewChannel(channelName, username as string, isGameChannel);
        if (channel) {
            socket.join(channelName);
            this.sio.to(channelName).emit('channel-created', channel);
        } else {
            this.sio.to(socket.id).emit('duplicate-name');
        }
    }

    async leaveChannel(socket: io.Socket, channelName: string) {
        const username = this.usernames.get(socket.id);
        await this.channelService.leaveChannel(channelName, username as string);
        this.sio.to(socket.id).emit('leave-channel');
        socket.leave(channelName);
    }

    async leaveChannelWithSocketId(socket: string, channelName: string) {
        const username = this.usernames.get(socket);
        await this.channelService.leaveChannel(channelName, username as string);
        this.sio.to(socket).emit('leave-channel');
    }

    async deleteChannel(channelName: string) {
        await this.channelService.deleteChannel(channelName);
        this.sio.to(channelName).emit('leave-channel');
    }
    userCreateChannel(socket: io.Socket) {
        socket.on('channel-creation', async (channelName: string) => {
            await this.createChannel(socket, channelName, false);
        });
    }

    userLeaveChannel(socket: io.Socket) {
        socket.on('leave-channel', async (channelName: string) => {
            await this.leaveChannel(socket, channelName);
        });
    }

    userDeleteChannel(socket: io.Socket) {
        socket.on('delete-channel', async (channelName: string) => {
            await this.deleteChannel(channelName);
        });
    }

    userTyping(socket: io.Socket) {
        socket.on('isTypingMessage', (message: ChatMessage) => {
            if (message.message.length > 0) {
                this.sio.to(message.channel as string).emit('isTypingMessage', { channel: message.channel, player: message.username });
            } else {
                this.sio.to(message.channel as string).emit('isNotTypingMessage', { channel: message.channel, player: message.username });
            }
        });
    }

    changeUsername(socket: io.Socket) {
        socket.on('change-username', (newUsername: string) => {
            this.usernames.delete(socket.id);
            console.log(newUsername);
            this.usernames.set(socket.id, newUsername);
            this.sio.emit('change-username', { username: newUsername, id: socket.id });
        });
    }

    getChoicePannelInfo(socket: io.Socket) {
        socket.on('choice-pannel-info', async (socketIds: string[]) => {
            console.log('recu serveur');
            console.log(socketIds);
            let usernameAndAvatars = {};
            for (let socket of socketIds) {
                let username = this.usernames.get(socket) as string;
                let icon = await this.iconService.getUserIcon(username);
                usernameAndAvatars[socket] = [username, icon[0]];
                console.log('iteration');
                console.log(usernameAndAvatars);
            }
            this.sio.to(socket.id).emit('choice-pannel-info', usernameAndAvatars);
        });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            // if (this.disconnectedSocket.oldSocketId) {
            //     const room = this.usersRoom.get(this.disconnectedSocket.oldSocketId) as string;
            //     socket.join(room);
            //     this.gameManager.refreshGame(socket.id, this.disconnectedSocket, room);
            //     this.disconnectedSocket.oldSocketId = '';
            // }
            console.log(`Connexion avec : ${socket.id}`);
            this.gameCreationHandler(socket);
            this.waitingRoomHostHandler(socket);
            this.waitingRoomJoinedPlayerHandler(socket);
            this.gameRoomsViewHandler(socket);
            this.joinGameHandler(socket);
            this.helpCommandHandler(socket);
            this.exchangeCommandHandler(socket);
            this.cooperativeModeHandler(socket);
            this.passCommandHandler(socket);
            this.chatHandler(socket);
            this.placeCommandViewHandler(socket);
            this.placeCommandHandler(socket);
            this.gameTurnHandler(socket);
            this.playerScoreHandler(socket);
            this.endGameHandler(socket);
            this.userConnectionHandler(socket);
            this.userDisconnectHandler(socket);
            this.userCreateChannel(socket);
            this.userJoinNewChannels(socket);
            this.userLeaveChannel(socket);
            this.userDeleteChannel(socket);
            this.userTyping(socket);
            this.changeUsername(socket);
            this.getChoicePannelInfo(socket);
            socket.on('disconnect', (reason) => {
                if (this.usernames.get(socket.id)) {
                    /* const MAX_DISCONNECTED_TIME = 5000;
                    const room = this.usersRoom.get(socket.id) as string; */
                    // non couvert dans les tests car impossible a stub reason ,confirmé avec le chargé
                    if (reason === 'transport close') {
                        this.loginService.changeConnectionState(this.usernames.get(socket.id) as string, false);
                        this.usernames.delete(socket.id);
                        /*  this.disconnectedSocket = { oldSocketId: socket.id, newSocketId: '' };
                        setTimeout(() => {
                            if (this.disconnectedSocket.oldSocketId && this.gameRooms.get(room)?.mode !== 'solo') {
                                this.gameManager.abandonGame(socket.id);
                                this.gameManager.leaveRoom(socket.id);
                            }
                            this.loginService.changeConnectionState(this.usernames.get(socket.id) as string,false);
                        }, MAX_DISCONNECTED_TIME); */
                    }
                }
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
            });
        });
    }
}
