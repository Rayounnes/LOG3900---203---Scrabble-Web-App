/* eslint-disable max-lines */
import { Command } from '@app/interfaces/command';
import { Game } from '@app/interfaces/game';
import { Letter } from '@app/interfaces/lettre';
import { Placement } from '@app/interfaces/placement';
import { JoinInfos } from '@app/interfaces/join-infos';
import { ScrabbleClassic } from '@app/classes/scrabble-classic';
// import { ScrabbleClassicSolo } from '@app/classes/scrabble-classic-solo';
import { SocketUser } from '@app/interfaces/socket-user';
import { SoloGame } from '@app/interfaces/solo-game';
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
import { ModeOrthography } from './mode-orthography.service';

export class SocketManager {
    private sio: io.Server;
    private roomIncrement = 1;
    private roomName: string;
    private usernames = new Map<string, string>(); // socket id - username;
    private gameRooms = new Map<string, Game>(); // roomname - game
    private scrabbleGames = new Map<string, ScrabbleClassic>(); // roomname - game
    private usersRoom = new Map<string, string>(); // socket id -room
    private disconnectedSocket: SocketUser = { oldSocketId: '', newSocketId: '' };
    private gameManager: GameManager;
    private loginService: LoginService;
    private channelService: ChannelService;
    private modeOrthography: ModeOrthography;

    constructor(server: http.Server, private databaseService: DatabaseService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomName = 'room' + this.roomIncrement;
        this.gameManager = new GameManager(this.sio, this.usernames, this.usersRoom, this.gameRooms, this.scrabbleGames);
        this.loginService = new LoginService(this.databaseService);
        this.channelService = new ChannelService(this.databaseService);
        this.modeOrthography = new ModeOrthography(this.databaseService);
    }
    changeRoomName() {
        this.roomIncrement++;
        this.roomName = 'room' + this.roomIncrement;
    }
    createGame(game: Game, socketId: string) {
        game.room = `Partie de ${game.hostUsername}`;
        this.gameRooms.set(game.room, game);
        game.hostID = socketId;
        this.usersRoom.set(socketId, game.room);
    }
    gameList(isClassic: boolean): Game[] {
        return Array.from(this.gameRooms.values()).filter((game: Game) => {
            const classic = game.isClassicMode === isClassic;
            const privateFull = classic && game.isPrivate && !game.isFullPlayers;
            return !game.isPrivate ? classic : privateFull;
        });
    }
    gameCreationHandler(socket: io.Socket) {
        socket.on('create-game', async (game: Game) => {
            game.joinedPlayers = typeof game.joinedPlayers === 'string' ? JSON.parse(game.joinedPlayers) : game.joinedPlayers;
            game.joinedObservers = typeof game.joinedObservers === 'string' ? JSON.parse(game.joinedObservers) : game.joinedObservers;
            console.log('game: ', game);
            this.createGame(game, socket.id);
            await this.createChannel(socket, game.room, true);
            game.joinedPlayers.push({ username: game.hostUsername, socketId: socket.id });
            console.log('emetting create-game');
            this.sio.to(game.room).emit('create-game', game);
            this.sio.emit('update-joinable-matches', this.gameList(game.isClassicMode));
        });

        socket.on('dictionary-selected', (dictionary: Dictionary) => {
            this.sio.emit('dictionary-selected', dictionary);
        });
        socket.on('create-solo-game', (game: SoloGame) => {
            this.createGame(game, socket.id);
            game.isFinished = false;
            socket.join(this.roomName);
            // this.scrabbleGames.set(
            //     this.roomName,
            //     new ScrabbleClassicSolo(socket.id, game.virtualPlayerName, game.dictionary.fileName, game.difficulty, game.mode === 'LOG2990'),
            // );
            if (this.scrabbleGames.get(game.room)?.socketTurn !== socket.id) {
                this.gameManager.virtualPlayerPlay(game.room);
            }

            this.changeRoomName();
        });
    }
    waitingRoomHostHandler(socket: io.Socket) {
        socket.on('cancel-match', async () => {
            const gameCanceled = this.gameRooms.get(this.usersRoom.get(socket.id) as string) as Game;
            this.gameManager.leaveRoom(socket.id);
            socket.leave(gameCanceled.room);
            this.sio.to(gameCanceled.room).emit('cancel-match');
            for (const player of gameCanceled.joinedPlayers) this.sio.sockets.sockets.get(player.socketId)?.leave(gameCanceled.room);
            for (const observer of gameCanceled.joinedObservers) this.sio.sockets.sockets.get(observer.socketId)?.leave(gameCanceled.room);
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
    joinGameHandler(socket: io.Socket) {
        socket.on('join-game', (gamePlayer: JoinInfos) => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            // if (game) game.usernameTwo = gamePlayer.playerUsername;
            const opponentId = this.gameManager.findOpponentSocket(socket.id);
            this.scrabbleGames.set(room, new ScrabbleClassic(socket.id, opponentId, game.dictionary.fileName, gamePlayer.mode === 'LOG2990'));
            this.sio.to(room).emit('join-game');
            const opponentGame = Object.assign({}, game);
            // opponentGame.usernameOne = game.usernameTwo;
            // opponentGame.usernameTwo = game.usernameOne;
            (this.scrabbleGames.get(room) as ScrabbleClassic).setPrivateGoalsForPlayers();

            this.sio.to(socket.id).emit('send-info-to-panel', game);
            this.sio.to(opponentId).emit('send-info-to-panel', opponentGame);
            this.sio.to(room).emit('user-turn', this.scrabbleGames.get(room)?.socketTurn);
            if (gamePlayer.mode === 'LOG2990') {
                this.sio.to(room).emit('public-goals', this.scrabbleGames.get(room)?.getPublicGoals());
                this.sio.to(socket.id).emit('private-goal', this.scrabbleGames.get(room)?.getPrivateGoal(socket.id));
                this.sio.to(opponentId).emit('private-goal', this.scrabbleGames.get(room)?.getPrivateGoal(opponentId));
            }
        });
    }
    helpCommandHandler(socket: io.Socket) {
        socket.on('reserve-command', () => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const reserveResult: Command = scrabbleGame.reserveState();
            this.sio.to(socket.id).emit('reserve-command', reserveResult);
        });
        socket.on('help-command', () => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const helpMessage: Command = scrabbleGame.commandInfo();
            this.sio.to(socket.id).emit('help-command', helpMessage);
        });
        socket.on('hint-command', () => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const hintWords: string = scrabbleGame.getPlayerHintWords(socket.id);
            this.sio.to(socket.id).emit('chatMessage', { type: 'system', message: hintWords });
        });
    }
    exchangeCommandHandler(socket: io.Socket) {
        socket.on('exchange-command', (letters: string) => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const exchangeResult: Command = scrabbleGame.exchangeLetters(letters);
            scrabbleGame.changeExchangeCounter();
            this.sio.to(socket.id).emit('exchange-command', exchangeResult);
        });
        socket.on('exchange-opponent-message', (numberLetters: number) => {
            const username = this.usernames.get(socket.id);
            const opponentSocket = this.gameManager.findOpponentSocket(socket.id);
            this.sio.to(opponentSocket).emit('chatMessage', { type: 'player', message: `${username} : !échanger ${numberLetters} lettre(s)` });
        });
    }
    passCommandHandler(socket: io.Socket) {
        socket.on('pass-turn', () => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
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
            this.sio.to(socket.id).emit('draw-letters-rack', this.scrabbleGames.get(room)?.getPlayerRack(socket.id));
        });
        socket.on('remove-letters-rack', (letters: Letter[]) => {
            const room = this.usersRoom.get(socket.id) as string;
            const playerRackLettersRemoved = this.scrabbleGames.get(room)?.removeLettersRackForValidation(socket.id, letters) as string[];
            this.sio.to(socket.id).emit('draw-letters-rack', playerRackLettersRemoved);
        });
        socket.on('freeze-timer', () => {
            const room = this.usersRoom.get(socket.id) as string;
            this.sio.to(room).emit('freeze-timer');
        });
        socket.on('update-reserve', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.scrabbleGames.get(room) as ScrabbleClassic;
            const reserveLength: number = game.getReserveLettersLength();
            this.sio.to(room).emit('update-reserve', reserveLength);
        });

        socket.on('draw-letters-opponent', (lettersPosition) => {
            const opponentSocket: string = this.gameManager.findOpponentSocket(socket.id);
            this.sio.to(opponentSocket).emit('draw-letters-opponent', lettersPosition);
        });
    }
    placeCommandHandler(socket: io.Socket) {
        socket.on('verify-place-message', (command: WordArgs) => {
            const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const lettersPosition = scrabbleGame.verifyPlaceCommand(command.line, command.column, command.value, command.orientation);
            const writtenCommand = '!placer ' + COLUMNS_LETTERS[command.line] + (command.column + 1) + command.orientation + ' ' + command.value;
            this.sio.to(socket.id).emit('verify-place-message', {
                letters: lettersPosition as string | Letter[],
                command: writtenCommand,
            } as Placement);
        });
        socket.on('validate-created-words', (lettersPlaced: Placement) => {
            const room = this.usersRoom.get(socket.id) as string;
            const opponentSocket = this.gameManager.findOpponentSocket(socket.id);
            const username = this.usernames.get(socket.id) as string;
            const scrabbleGame = this.scrabbleGames.get(room) as ScrabbleClassic;
            const score = scrabbleGame.validateCalculateWordsPoints(lettersPlaced.letters);
            if (scrabbleGame.logMode) {
                this.sio.to(room).emit('public-goals', this.scrabbleGames.get(room)?.getPublicGoals());
                this.sio.to(socket.id).emit('private-goal', this.scrabbleGames.get(room)?.getPrivateGoal(socket.id));
                this.sio.to(opponentSocket).emit('private-goal-opponent', this.scrabbleGames.get(room)?.getPrivateGoal(socket.id));
            }
            this.sio.to(socket.id).emit('validate-created-words', { letters: lettersPlaced.letters, points: score });
            if (score !== 0) {
                this.sio.to(room).emit('chatMessage', { type: 'player', message: `${username} : ${lettersPlaced.command}` });
                this.gameManager.isEndGame(room, scrabbleGame);
            }
        });
    }
    playerScoreHandler(socket: io.Socket) {
        socket.on('send-player-score', () => {
            // const room = this.usersRoom.get(socket.id) as string;
            const opponentSocket: string = this.gameManager.findOpponentSocket(socket.id);
            const game = this.scrabbleGames.get(this.usersRoom.get(socket.id) as string) as ScrabbleClassic;
            const tilesLeft: number = game.getPlayerTilesLeft(socket.id);
            this.sio.to(socket.id).emit('update-player-score', {
                points: game.getPlayerScore(socket.id),
                playerScored: true,
                tiles: tilesLeft,
            });
            this.sio.to(opponentSocket).emit('update-player-score', {
                points: game.getPlayerScore(socket.id),
                playerScored: false,
                tiles: tilesLeft,
            });
        });
     


    }
    gameTurnHandler(socket: io.Socket) {
        socket.on('change-user-turn', () => {
            const room = this.usersRoom.get(socket.id) as string;
            this.gameManager.changeTurn(room);
            // if (this.gameRooms.get(this.usersRoom.get(socket.id) as string)?.type === 'solo' && !(this.gameRooms.get(room) as SoloGame).isFinished) {
            //     this.gameManager.virtualPlayerPlay(room);
            // }
        });
    }
    endGameHandler(socket: io.Socket) {
        socket.on('abandon-game', () => {
            this.gameManager.abandonGame(socket.id);
            socket.disconnect();
        });
        socket.on('quit-game', () => {
            this.sio
                .to(this.gameManager.findOpponentSocket(socket.id))
                .emit('chatMessage', { type: 'system', message: `${this.usernames.get(socket.id)} a quitté le jeu.` });
            this.gameManager.leaveRoom(socket.id);
            socket.disconnect();
        });
    }

    userConnectionHandler(socket: io.Socket) {
        socket.on('user-connection', (loginInfos) => {
            this.usernames.set(loginInfos.socketId, loginInfos.username);
            this.userJoinChannels(socket);
            this.loginService.changeConnectionState(loginInfos.username, true);
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
        socket.join(channelName);
        this.sio.to(channelName).emit('channel-created', channel);
    }

    async leaveChannel(socket: io.Socket, channelName: string) {
        const username = this.usernames.get(socket.id);
        await this.channelService.leaveChannel(channelName, username as string);
        this.sio.to(socket.id).emit('leave-channel');
        socket.leave(channelName);
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

    async verifyMaxScore(socket : io.Socket, score: any) {
        const username = this.usernames.get(socket.id);
        await this.modeOrthography.sendScore(score, username as string);
    }

    scoreOrthography(socket: io.Socket) {
        socket.on('score-orthography', async (score) => {
            await this.verifyMaxScore(socket, score);
          

           
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
                console.log('dans server typing');
                this.sio.to(message.channel as string).emit('isTypingMessage', { channel: message.channel, player: message.username });
            } else {
                console.log('dans server nottyping');
                this.sio.to(message.channel as string).emit('isNotTypingMessage', { channel: message.channel, player: message.username });
                console.log(message.username);
            }
        });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            if (this.disconnectedSocket.oldSocketId) {
                const room = this.usersRoom.get(this.disconnectedSocket.oldSocketId) as string;
                socket.join(room);
                this.gameManager.refreshGame(socket.id, this.disconnectedSocket, room);
                this.disconnectedSocket.oldSocketId = '';
            }
            console.log(`Connexion avec : ${socket.id}`);
            this.gameCreationHandler(socket);
            this.waitingRoomHostHandler(socket);
            this.waitingRoomJoinedPlayerHandler(socket);
            this.gameRoomsViewHandler(socket);
            this.joinGameHandler(socket);
            this.helpCommandHandler(socket);
            this.exchangeCommandHandler(socket);
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
            this.scoreOrthography(socket);
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
