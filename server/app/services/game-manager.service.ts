import { Game } from '@app/interfaces/game';
import * as io from 'socket.io';
import { VirtualPlayerService } from '@app/services/virtual-player.service';
import { COMMANDS } from '@app/constants/constants';
import { ScrabbleClassicMode } from '@app/classes/scrabble-classic-mode';
import { ScrabbleCooperativeMode } from '@app/classes/scrabble-cooperative-mode';
import { GamePlayerInfos } from '@app/interfaces/game-player-infos';

const THREE_SECOND = 3000;
const TWENTY_SECONDS = 20000;

export class GameManager {
    private sio: io.Server;
    private virtualPlayer: VirtualPlayerService;
    private usernames: Map<string, string>; // socket id - username;
    private gameRooms: Map<string, Game>; // roomname - game
    private scrabbleGames: Map<string, ScrabbleClassicMode>; // roomname - game
    private scrabbleCooperativeGames: Map<string, ScrabbleCooperativeMode>; // roomname - game
    private usersRoom: Map<string, string>; // socket id -room
    constructor(
        sio: io.Server,
        usernames: Map<string, string>,
        usersRoom: Map<string, string>,
        gameRooms: Map<string, Game>,
        scrabbleGames: Map<string, ScrabbleClassicMode>,
        scrabbleCooperativeGames: Map<string, ScrabbleCooperativeMode>,
    ) {
        this.sio = sio;
        this.virtualPlayer = new VirtualPlayerService(this.sio);
        this.usernames = usernames;
        this.usersRoom = usersRoom;
        this.gameRooms = gameRooms;
        this.scrabbleGames = scrabbleGames;
        this.scrabbleCooperativeGames = scrabbleCooperativeGames;
    }
    leaveRoom(socketId: string) {
        this.usersRoom.delete(socketId);
        // this.usernames.delete(socketId);
    }
    getScrabbleGame(socketId: string) {
        const room = this.usersRoom.get(socketId) as string;
        const game = this.gameRooms.get(room) as Game;
        const scrabbleGame = game.isClassicMode
            ? (this.scrabbleGames.get(room) as ScrabbleClassicMode)
            : (this.scrabbleCooperativeGames.get(room) as ScrabbleCooperativeMode);
        return scrabbleGame;
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
        const scrabbleGame = this.getScrabbleGame(socketId);
        const notPlayerSockets = scrabbleGame.isClassicMode
            ? (scrabbleGame as ScrabbleClassicMode).notTurnSockets
            : (scrabbleGame as ScrabbleCooperativeMode).notPlayerSockets(socketId);
        return notPlayerSockets as string[];
    }
    endGameMessage(room: string, scrabbleGame: ScrabbleClassicMode | ScrabbleCooperativeMode) {
        const endMessage = this.transformEndGameMessage(scrabbleGame.gameEndedMessage());
        // TODO Transformer en popup
        this.sio.to(room).emit('end-popup', endMessage);
    }
    abandonClassicGame(socketId: string) {
        const room = this.usersRoom.get(socketId) as string;
        const game: Game = this.gameRooms.get(room) as Game;
        game.virtualPlayers++;
        game.joinedPlayers = game.joinedPlayers.filter((player) => player.socketId !== socketId);
        const gameScrabbleAbandoned = this.scrabbleGames.get(room) as ScrabbleClassicMode;
        const virtualPlayer: string = gameScrabbleAbandoned.abandonPlayer(socketId);
        const abandonMessage = `${this.usernames.get(
            socketId,
        )} a abandonné la partie. Le joueur a été remplacé par le joueur virtuel ${virtualPlayer}.`;
        this.leaveRoom(socketId);
        this.sio.to(room).emit('abandon-game', abandonMessage);
        // this.sio.to(room).emit('chatMessage', {
        //     username: '',
        //     message: abandonMessage,
        //     time: new Date().toTimeString().split(' ')[0],
        //     type: 'system',
        //     channel: room,
        // });
        // Tous les joueurs humains ont abandonné la partie, on arrete la partie
        if (gameScrabbleAbandoned.humansPlayerInGame === 0) {
            this.endGameBehavior(room, gameScrabbleAbandoned);
            return;
        }
        // Si le joueur a quitté pendant son tour, on fait jouer le joueur virtuel qu'il a remplacé
        if (virtualPlayer === gameScrabbleAbandoned.socketTurn) {
            this.sio.to(room).emit('user-turn', gameScrabbleAbandoned.socketTurn);
            this.virtualPlayerPlay(room);
        } else {
            const data = { players: gameScrabbleAbandoned.getPlayersInfo(), turnSocket: gameScrabbleAbandoned.socketTurn };
            this.sio.to(room).emit('send-info-to-panel', data);
        }
    }
    abandonCooperativeGame(socketId: string) {
        const room = this.usersRoom.get(socketId) as string;
        const game: Game = this.gameRooms.get(room) as Game;
        game.joinedPlayers = game.joinedPlayers.filter((player) => player.socketId !== socketId);
        const gameScrabbleAbandoned = this.getScrabbleGame(socketId) as ScrabbleCooperativeMode;
        const playerRemaining: number = gameScrabbleAbandoned.abandonPlayer(socketId);
        const abandonMessage = `${this.usernames.get(socketId)} a abandonné la partie.`;
        this.leaveRoom(socketId);
        this.sio.to(room).emit('abandon-game', abandonMessage);
        // Si il reste un joueur humain, on arrete la partie
        if (playerRemaining === 1) {
            this.endGameBehavior(room, gameScrabbleAbandoned);
            return;
        }
        const data = { players: gameScrabbleAbandoned.getPlayersInfo(), turnSocket: gameScrabbleAbandoned.socketTurn };
        this.sio.to(room).emit('send-info-to-panel', data);
    }
    // observateur qui rejoint lorsque la partie a deja commencé (il faut redessiner les lettres du board)
    joinAsLateObserver(socketId: string, room: string) {
        const scrabbleGame = this.getScrabbleGame(socketId) as ScrabbleCooperativeMode;
        scrabbleGame.setObserver(true, socketId);
        const game: Game = this.gameRooms.get(room) as Game;
        const data = { players: scrabbleGame.getPlayersInfo(), turnSocket: scrabbleGame.socketTurn };
        this.sio.to(socketId).emit('send-game-timer', game.time);
        // this.sio.to(socketId).emit('user-turn', scrabbleGame.socketTurn);
        this.sio.to(socketId).emit('send-info-to-panel', data);
        const lettersPosition = scrabbleGame.boardLetters;
        this.sio.to(socketId).emit('draw-letters-opponent', lettersPosition);
        const reserveLength: number = scrabbleGame.getReserveLettersLength();
        this.sio.to(socketId).emit('update-reserve', reserveLength);
    }

    isEndGame(room: string, scrabbleGame: ScrabbleClassicMode | ScrabbleCooperativeMode): boolean {
        if (scrabbleGame.gameEnded()) {
            this.endGameBehavior(room, scrabbleGame);
            return true;
        }
        return false;
    }
    async endGameBehavior(room: string, scrabbleGame: ScrabbleClassicMode | ScrabbleCooperativeMode) {
        const gameFinished = this.gameRooms.get(room) as Game;
        gameFinished.isFinished = true;
        this.endGameMessage(room, scrabbleGame);
        this.sio.to(room).emit('recreate');
        this.sio.to(room).emit('end-game');
        const playersInfo: GamePlayerInfos[] = scrabbleGame.getPlayersInfo();
        const data = { players: playersInfo, turnSocket: scrabbleGame.socketTurn };
        for (const player of playersInfo) {
            if (!player.isVirtualPlayer) {
                this.calculateCoinsWin(player);
            }
        }
        this.sio.to(room).emit('send-info-to-panel', data);
    }
    // TODO a corriger pour les joeurs virtuels
    virtualPlayerPlay(room: string) {
        const passTime = setTimeout(() => {
            this.virtualPlayer.virtualPlayerPass(room, this.scrabbleGames.get(room) as ScrabbleClassicMode);
            // this.isEndGame(room, this.scrabbleGames.get(room) as ScrabbleClassicMode);
            this.changeTurn(room);
        }, TWENTY_SECONDS);
        setTimeout(() => {
            const [successCommand, isEndGame] = this.virtualPlayerCommand(room);
            if (successCommand) {
                clearInterval(passTime);
                if (!isEndGame) this.changeTurn(room);
            }
        }, THREE_SECOND);
    }
    virtualPlayerCommand(room: string): boolean[] {
        const command: COMMANDS = (this.scrabbleGames.get(room) as ScrabbleClassicMode).commandVirtualPlayer;
        const scrabbleGame = this.scrabbleGames.get(room) as ScrabbleClassicMode;
        let commandSuccess = true;
        let isEndGame = false;
        switch (command) {
            case COMMANDS.Placer:
                commandSuccess = this.virtualPlayer.virtualPlayerPlace(room, scrabbleGame);
                if (!commandSuccess) {
                    commandSuccess = this.virtualPlayer.virtualPlayerExchange(room, scrabbleGame);
                } else {
                    isEndGame = this.isEndGame(room, scrabbleGame);
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
        return [commandSuccess, isEndGame];
    }

    calculateCoinsWin(player: GamePlayerInfos) {
        const coinsWon: number = Math.round(Math.max(5, player.points / 10));
        if (player.socket) this.sio.to(player.socket).emit('coins-win', coinsWon);
    }
}
