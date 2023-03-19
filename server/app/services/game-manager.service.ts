import { Game } from '@app/interfaces/game';
import * as io from 'socket.io';
import { SoloGame } from '@app/interfaces/solo-game';
import { VirtualPlayerService } from '@app/services/virtual-player.service';
import { COMMANDS } from '@app/constants/constants';
import { ScrabbleClassicMode } from '@app/classes/scrabble-classic-mode';

const THREE_SECOND = 3000;
const TWENTY_SECONDS = 20000;

export class GameManager {
    private sio: io.Server;
    private virtualPlayer: VirtualPlayerService;
    private usernames: Map<string, string>; // socket id - username;
    // private gameRooms: Map<string, Game>; // roomname - game
    private scrabbleGames: Map<string, ScrabbleClassicMode>; // roomname - game
    private usersRoom: Map<string, string>; // socket id -room
    constructor(
        sio: io.Server,
        usernames: Map<string, string>,
        usersRoom: Map<string, string>,
        gameRooms: Map<string, Game>,
        scrabbleGames: Map<string, ScrabbleClassicMode>,
    ) {
        this.sio = sio;
        this.virtualPlayer = new VirtualPlayerService(this.sio);
        this.usernames = usernames;
        this.usersRoom = usersRoom;
        // this.gameRooms = gameRooms;
        this.scrabbleGames = scrabbleGames;
    }
    leaveRoom(socketId: string) {
        this.usersRoom.delete(socketId);
        // this.usernames.delete(socketId);
    }
    changeTurn(room: string) {
        const scrabbleGame = this.scrabbleGames.get(room) as ScrabbleClassicMode;
        scrabbleGame.toggleTurn();
        this.sio.to(room).emit('user-turn', scrabbleGame.socketTurn);
        /* let data = {players : scrabbleGame.getPlayersInfo(), turnSocket :scrabbleGame.socketTurn}
        this.sio.to(room).emit('send-info-to-panel', data); */
        // Si le prochain tour est aussi un joueur virtuel, on fait jouer le prochain bot
        if (scrabbleGame.virtualNames.includes(scrabbleGame.socketTurn)) {
            this.virtualPlayerPlay(room);
        }
    }
    transformEndGameMessage(socketAndLetters: string[]): string {
        let message = 'Fin de partie - lettres restantes\n';
        for (let i = 0; i < socketAndLetters.length; i += 2) {
            let username = this.usernames.get(socketAndLetters[i]) as string;
            if (!username) username = socketAndLetters[i];
            const lettersLeft: string = socketAndLetters[i + 1];
            message += `${username} : ${lettersLeft}`;
            if (i === 0) message += '\n';
        }
        return message;
    }
    findOpponentSockets(socketId: string): string[] {
        const room = this.usersRoom.get(socketId) as string;
        const scrabbleGame = this.scrabbleGames.get(room);
        return scrabbleGame?.notTurnSockets as string[];
    }
    endGameMessage(room: string, scrabbleGame: ScrabbleClassicMode) {
        const endMessage = this.transformEndGameMessage(scrabbleGame.gameEndedMessage());
        // TODO Transformer en popup
        this.sio.to(room).emit('end-popup', endMessage);
    }
    transformToSoloGame(game: SoloGame, opponentSocket: string): SoloGame {
        game.hostID = opponentSocket;
        // game.type = 'solo';
        // game.isFinished = false;
        // game.usernameOne = this.usernames.get(opponentSocket) as string;
        // game.usernameTwo = game.usernameOne.toLowerCase() !== 'marc' ? 'Marc' : 'Ben';
        // game.virtualPlayerName = game.usernameTwo;
        // game.difficulty = LEVEL.Beginner;
        return game;
    }
    abandonGame(socketId: string) {
        // const opponentSocket: string = this.findOpponentSocket(socketId);
        // const room = this.usersRoom.get(socketId) as string;
        // const game: SoloGame = this.transformToSoloGame(this.gameRooms.get(room) as SoloGame, opponentSocket);
        // const gameScrabbleAbandonned = this.scrabbleGames.get(room) as ScrabbleClassic;
        // const scrabbleSoloGame = new ScrabbleClassicSolo(
        //     game.hostID,
        //     game.usernameTwo,
        //     game.dictionary.fileName,
        //     game.difficulty,
        //     game.mode === 'LOG2990',
        // );
        // const soloGame = gameScrabbleAbandonned.transformToSoloGame(scrabbleSoloGame, game);
        // this.scrabbleGames.set(room, soloGame);
        // const abandomMessage = `${this.usernames.get(socketId)} a abandonné la partie.La partie est convertie en mode solo avec un joueur débutant.`;
        // this.sio.to(opponentSocket).emit('abandon-game');
        // this.sio.to(opponentSocket).emit('chatMessage', { type: 'system', message: abandomMessage });
        // this.sio.to(opponentSocket).emit('send-info-to-panel', game);
        // if (this.scrabbleGames.get(room)?.socketTurn !== game.hostID) {
        //     this.sio.to(opponentSocket).emit('user-turn', this.scrabbleGames.get(room)?.socketTurn);
        //     this.virtualPlayerPlay(room);
        // }
    }
    isEndGame(room: string, scrabbleGame: ScrabbleClassicMode): boolean {
        if (scrabbleGame.gameEnded()) {
            this.endGameMessage(room, scrabbleGame);
            this.sio.to(room).emit('end-game');
            return true;
        }
        return false;
    }
    // TODO a corriger pour les joeurs virtuels
    virtualPlayerPlay(room: string) {
        const passTime = setTimeout(() => {
            this.virtualPlayer.virtualPlayerPass(room, this.scrabbleGames.get(room) as ScrabbleClassicMode);
            // this.isEndGame(room, this.scrabbleGames.get(room) as ScrabbleClassicMode);
            this.changeTurn(room);
        }, TWENTY_SECONDS);
        setTimeout(() => {
            const successCommand: boolean = this.virtualPlayerCommand(room);
            if (successCommand) {
                clearInterval(passTime);
                this.changeTurn(room);
            }
        }, THREE_SECOND);
    }
    virtualPlayerCommand(room: string): boolean {
        const command: COMMANDS = (this.scrabbleGames.get(room) as ScrabbleClassicMode).commandVirtualPlayer;
        const scrabbleGame = this.scrabbleGames.get(room) as ScrabbleClassicMode;
        let commandSuccess = true;
        switch (command) {
            case COMMANDS.Placer:
                commandSuccess = this.virtualPlayer.virtualPlayerPlace(room, scrabbleGame);
                if (!commandSuccess) {
                    commandSuccess = this.virtualPlayer.virtualPlayerExchange(room, scrabbleGame);
                } else {
                    this.isEndGame(room, scrabbleGame);
                }
                break;
            case COMMANDS.Échanger:
                commandSuccess = this.virtualPlayer.virtualPlayerExchange(room, scrabbleGame);
                break;
            case COMMANDS.Passer:
                this.virtualPlayer.virtualPlayerPass(room, scrabbleGame);
                // this.isEndGame(room, scrabbleGame);
                break;
        }
        return commandSuccess;
    }
    // updatePannel(game: Game, socketUser: SocketUser) {
    //     if (game.hostID === socketUser.oldSocketId) {
    //         game.hostID = socketUser.newSocketId;
    //         this.sio.to(socketUser.newSocketId).emit('send-info-to-panel', game);
    //     } else {
    //         const opponentGame = Object.assign({}, game);
    //         // opponentGame.usernameOne = game.usernameTwo;
    //         // opponentGame.usernameTwo = game.usernameOne;
    //         this.sio.to(socketUser.newSocketId).emit('send-info-to-panel', opponentGame);
    //     }
    // }

    // updateScores(socketUser: SocketUser, scrabbleGame: ScrabbleClassic) {
    //     this.sio.to(socketUser.newSocketId).emit('update-player-score', {
    //         points: scrabbleGame.getPlayerScore(socketUser.newSocketId),
    //         playerScored: true,
    //         tiles: scrabbleGame.getPlayerTilesLeft(socketUser.newSocketId),
    //     });
    //     this.sio.to(socketUser.newSocketId).emit('update-player-score', {
    //         points: scrabbleGame.getPlayerScore(scrabbleGame.notTurnSocket),
    //         playerScored: false,
    //         tiles: scrabbleGame.getPlayerTilesLeft(scrabbleGame.notTurnSocket),
    //     });
    // }
    // refreshGame(socketId: string, disconnectedSocket: SocketUser, room: string) {
    //     const socketUser = disconnectedSocket;
    //     socketUser.newSocketId = socketId;
    //     const scrabbleGame = this.scrabbleGames.get(this.usersRoom.get(socketUser.oldSocketId) as string) as ScrabbleClassic;
    //     scrabbleGame.changeSocket(socketUser);
    //     this.usernames.set(socketId, this.usernames.get(socketUser.oldSocketId) as string);
    //     this.usersRoom.set(socketId, room);
    //     this.leaveRoom(socketUser.oldSocketId);
    //     const game = this.gameRooms.get(room) as Game;
    //     this.updatePannel(game, socketUser);
    //     const lettersPosition = scrabbleGame.boardLetters;
    //     this.sio.to(socketId).emit('draw-letters-opponent', lettersPosition);
    //     this.updateScores(socketUser, scrabbleGame);
    //     this.sio.to(room).emit('user-turn', scrabbleGame.socketTurn);
    // }
}
