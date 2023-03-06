import { Command } from '@app/interfaces/command';
import { Game } from '@app/interfaces/game';
import { Letter } from '@app/interfaces/lettre';
import { Placement } from '@app/interfaces/placement';
import { JoinInfos } from '@app/interfaces/join-infos';
import { ScrabbleClassic } from '@app/classes/scrabble-classic';
import { ScrabbleClassicSolo } from '@app/classes/scrabble-classic-solo';
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
import { ChannelService } from './channels.service';


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
    private loginService : LoginService;
    private channelService : ChannelService;

    constructor(server: http.Server, private databaseService : DatabaseService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomName = 'room' + this.roomIncrement;
        this.gameManager = new GameManager(this.sio, this.usernames, this.usersRoom, this.gameRooms, this.scrabbleGames);
        this.loginService = new LoginService(this.databaseService);
        this.channelService = new ChannelService(this.databaseService)
    }
    changeRoomName() {
        this.roomIncrement++;
        this.roomName = 'room' + this.roomIncrement;
    }
    createGame(game: Game, type: string, socketId: string) {
        game.room = this.roomName;
        if (type !== 'solo') game.isJoined = false;
        this.gameRooms.set(this.roomName, game);
        game.hostID = socketId;
        this.usernames.set(socketId, game.usernameOne);
        this.usersRoom.set(socketId, this.roomName);
    }
    gameList(gameMode: string): Game[] {
        return Array.from(this.gameRooms.values()).filter((game: Game) => game.type !== 'solo' && game.mode === gameMode);
    }
    gameCreationHandler(socket: io.Socket) {
        socket.on('create-game', (game: Game) => {
            this.createGame(game, 'multiplayer', socket.id);
            socket.join(this.roomName);
            this.sio.to(this.roomName).emit('create-game', game.usernameOne);
            this.sio.emit('update-joinable-matches', this.gameList(game.mode));
            this.changeRoomName();
        });

        socket.on('dictionary-selected', (dictionary: Dictionary) => {
            this.sio.emit('dictionary-selected', dictionary);
        });
        socket.on('create-solo-game', (game: SoloGame) => {
            this.createGame(game, 'solo', socket.id);
            game.isFinished = false;
            socket.join(this.roomName);
            this.scrabbleGames.set(
                this.roomName,
                new ScrabbleClassicSolo(socket.id, game.virtualPlayerName, game.dictionary.fileName, game.difficulty, game.mode === 'LOG2990'),
            );
            game.usernameTwo = game.virtualPlayerName;
            this.sio.to(socket.id).emit('send-info-to-panel', game);
            this.sio.to(this.roomName).emit('user-turn', this.scrabbleGames.get(this.roomName)?.socketTurn);
            if (game.mode === 'LOG2990') {
                (this.scrabbleGames.get(this.roomName) as ScrabbleClassic).setPrivateGoalsForPlayers();
                this.sio.to(this.roomName).emit('public-goals', this.scrabbleGames.get(this.roomName)?.getPublicGoals());
                this.sio.to(socket.id).emit('private-goal', this.scrabbleGames.get(this.roomName)?.getPrivateGoal(socket.id));
            }
            if (this.scrabbleGames.get(game.room)?.socketTurn !== socket.id) {
                this.gameManager.virtualPlayerPlay(game.room);
            }

            this.changeRoomName();
        });
    }
    waitingRoomHostHandler(socket: io.Socket) {
        socket.on('kick-user', () => {
            const hostUsername = this.usernames.get(socket.id) as string;
            const room = this.usersRoom.get(socket.id) as string;
            const game = this.gameRooms.get(room) as Game;
            const joinSocket = this.gameManager.findOpponentSocket(socket.id);
            this.sio.sockets.sockets.get(joinSocket)?.leave(room);
            this.gameManager.leaveRoom(joinSocket);
            this.sio.to(joinSocket).emit('kick-user', hostUsername);
            (this.gameRooms.get(room) as Game).isJoined = false;
            this.sio.emit('update-joinable-matches', this.gameList(game.mode));
        });
        socket.on('cancel-match', () => {
            const gameCanceled = this.gameRooms.get(this.usersRoom.get(socket.id) as string) as Game;
            this.gameManager.leaveRoom(socket.id);
            socket.leave(gameCanceled.room);
            this.sio.to(gameCanceled.room).emit('kick-user');
            this.gameRooms.delete(gameCanceled.room);
            this.sio.emit('update-joinable-matches', this.gameList(gameCanceled.mode));
        });
    }
    waitingRoomJoinedPlayerHandler(socket: io.Socket) {
        socket.on('joined-user-left', () => {
            const room = this.usersRoom.get(socket.id) as string;
            const hostSocket = this.gameManager.findOpponentSocket(socket.id);
            const game = this.gameRooms.get(room) as Game;

            socket.leave(room);
            this.gameManager.leaveRoom(socket.id);
            this.sio.to(hostSocket).emit('joined-user-left');
            (this.gameRooms.get(room) as Game).isJoined = false;
            this.sio.emit('update-joinable-matches', this.gameList(game.mode));
        });
        socket.on('waiting-room-second-player', (gameParams: Game) => {
            const roomToJoin = gameParams.room;
            socket.join(roomToJoin);
            this.usersRoom.set(socket.id, roomToJoin);
            this.usernames.set(socket.id, gameParams.usernameTwo);
            (this.gameRooms.get(roomToJoin) as Game).isJoined = true;
            this.sio.to(socket.id).emit('waiting-room-second-player', gameParams.usernameTwo);
            this.sio.to(roomToJoin).emit('add-second-player-waiting-room', gameParams);
            this.sio.emit('update-joinable-matches', this.gameList(gameParams.mode));
        });
    }
    gameRoomsViewHandler(socket: io.Socket) {
        socket.on('update-joinable-matches', (gameMode: string) => {
            this.sio.emit('update-joinable-matches', this.gameList(gameMode));
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
            if (game) game.usernameTwo = gamePlayer.playerUsername;
            const opponentId = this.gameManager.findOpponentSocket(socket.id);
            this.scrabbleGames.set(room, new ScrabbleClassic(socket.id, opponentId, game.dictionary.fileName, gamePlayer.mode === 'LOG2990'));
            this.sio.to(room).emit('join-game');
            const opponentGame = Object.assign({}, game);
            opponentGame.usernameOne = game.usernameTwo;
            opponentGame.usernameTwo = game.usernameOne;
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
            if (this.gameRooms.get(this.usersRoom.get(socket.id) as string)?.type === 'solo' && !(this.gameRooms.get(room) as SoloGame).isFinished) {
                this.gameManager.virtualPlayerPlay(room);
            }
        });
    }
    endGameHandler(socket: io.Socket) {
        socket.on('abandon-game', () => {
            const room = this.usersRoom.get(socket.id) as string;
            if ((this.gameRooms.get(room) as Game).type !== 'solo') {
                this.gameManager.abandonGame(socket.id);
            } else {
                this.sio.to(room).emit('end-game', true);
            }
            socket.disconnect();
        });
        socket.on('quit-game', () => {
            const room = this.usersRoom.get(socket.id) as string;
            if ((this.gameRooms.get(room) as Game).mode !== 'solo') {
                this.sio
                    .to(this.gameManager.findOpponentSocket(socket.id))
                    .emit('chatMessage', { type: 'system', message: `${this.usernames.get(socket.id)} a quitté le jeu.` });
            }
            this.gameManager.leaveRoom(socket.id);
            socket.disconnect();
        });
    }

    userConnectionHandler(socket: io.Socket){
        socket.on('user-connection', (loginInfos) => {
            this.usernames.set(loginInfos.socketId,loginInfos.username);
            this.userJoinChannels(socket)
        });
    }

    userDisconnectHandler(socket : io.Socket){
        socket.on('user-disconnect',  (socketId : string) => {
            let username = this.usernames.get(socketId);
            if(username){
                this.usernames.delete(socketId);
                this.loginService.changeConnectionState(username,false)
            }
        });
    }

    async userJoinChannels(socket : io.Socket){
        let username = this.usernames.get(socket.id);
        if(username){
            let channels = await this.channelService.getUserChannelsName(username)
            for(let channel of channels){
                console.log(channel);
                socket.join(channel);
            }
        }
    }

    async userJoinNewChannels(socket : io.Socket){
        socket.on('join-channel', async (channelNames) =>{
            let username = this.usernames.get(socket.id);
            await this.channelService.joinExistingChannels(channelNames,username as string);
            for(let channel of channelNames){
                socket.join(channel)
            }
            this.sio.to(socket.id).emit('channels-joined');

        })
    }

    userCreateChannel(socket : io.Socket){
        socket.on('channel-creation', async (channelName : string) =>{
            let username = this.usernames.get(socket.id);
            let channel = await this.channelService.createNewChannel(channelName,username as string);
            socket.join(channelName)
            this.sio.to(channelName).emit("channel-created", channel);
        });
    }

    userLeaveChannel(socket : io.Socket){
        socket.on('leave-channel', async (channelName : string) =>{
            let username = this.usernames.get(socket.id);
            await this.channelService.leaveChannel(channelName,username as string);
            this.sio.to(socket.id).emit("leave-channel");
            socket.leave(channelName)
        })
    }

    userDeleteChannel(socket : io.Socket) {
        socket.on('delete-channel', async (channelName : string) =>{
            await this.channelService.deleteChannel(channelName);
            this.sio.to(channelName).emit("leave-channel")
        })
    }

    userTyping(socket : io.Socket){
        socket.on('isTypingMessage', (message: ChatMessage) => {
            if(message.message.length > 0){
                console.log("dans server typing")
                this.sio.to(message.channel as string).emit('isTypingMessage', { channel: message.channel, player: message.username });
            }else{
                console.log("dans server nottyping")
                this.sio.to(message.channel as string).emit('isNotTypingMessage', { channel: message.channel, player: message.username });
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
            console.log(`Connexion avec : ${socket.id}`)
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
            socket.on('disconnect', (reason) => {
                if (this.usernames.get(socket.id)) {
                    /* const MAX_DISCONNECTED_TIME = 5000;
                    const room = this.usersRoom.get(socket.id) as string; */
                    // non couvert dans les tests car impossible a stub reason ,confirmé avec le chargé
                    if (reason === 'transport close') {
                        this.loginService.changeConnectionState(this.usernames.get(socket.id) as string,false);
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
