import { Board } from './board';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';
import { Letter } from '@app/interfaces/lettre';
import { Player } from './player';
import { ReserveService } from '@app/services/reserve.service';
import { ChevaletService } from '@app/services/chevalet.service';
import { ReserveCommandService } from '@app/services/reserve-command.service';
import { Command } from '@app/interfaces/command';

const PASS_MAX_STREAK = 6;
const MAX_PLAYERS = 4;
export class ScrabbleClassicMode {
    protected board;
    protected validationCountWords;
    protected exchangeService;
    protected firstTurn: boolean = true;
    protected gamePlayers: Map<string, Player> = new Map();
    protected turnSocket;
    protected socketIndexTurn;
    protected reserveLetters;
    protected passStreak;
    protected reserveCommandService;
    protected playersSockets: string[]; //Liste
    constructor(playersSockets: string[], fileName: string) {
        this.turnSocket = playersSockets[0];
        this.socketIndexTurn = 0;
        this.board = new Board();
        this.passStreak = 0;
        this.validationCountWords = new ValidationCountingWordsService(this.board, fileName);
        this.reserveLetters = new ReserveService();
        this.exchangeService = new ExchangeLettersService(this.reserveLetters);
        this.reserveCommandService = new ReserveCommandService(this.reserveLetters);
        for (const playerSocket of playersSockets)
            this.gamePlayers.set(playerSocket, new Player(this.reserveLetters, this.board, this.validationCountWords));
    }

    verifyPlaceCommand(lineN: number, columnN: number, letters: string, wordDirection: string): Letter[] | string {
        let validation = false;
        if (!this.gamePlayers?.get(this.turnSocket)?.lettersRack.areLettersInRack(letters))
            return 'Erreur de syntaxe : les lettres écrites dans la commande ne sont pas dans votre chevalet';
        if (this.firstTurn) {
            validation = this.board.areLettersInCenterOfBoard(lineN, columnN, letters, wordDirection);
            if (!validation)
                return 'Commande impossible a réaliser : ce placement de lettres sort du plateau ou ne posséde pas une lettre dans la case H8';
        } else {
            if (this.board.isFirstLetterOnALetter(lineN, columnN))
                return 'Commande impossible a réaliser : la position initiale choisi contient deja une lettre';
            validation = this.board.areLettersAttachedAndNotOutside(lineN, columnN, letters, wordDirection);
        }
        if (validation) return this.board.findLettersPosition(lineN, columnN, letters, wordDirection);
        return "Commande impossible a réaliser : ce placement de lettres sort du plateau ou n'est pas attaché a des lettres";
    }
    validateCalculateWordsPoints(letters: Letter[]): number {
        this.passStreak = 0;
        if (letters.length === 1 && this.firstTurn) return 0;
        let points = this.validationCountWords.verifyAndCalculateWords(letters);
        const stringLetters: string[] = letters.map((letter) => letter.value);
        if (points !== 0) {
            this.pointsUpdate(points, stringLetters);
        }
        return points;
    }

    pointsUpdate(points: number, lettersToRemove: string[]) {
        if (this.firstTurn) this.firstTurn = false;
        (this.gamePlayers?.get(this.turnSocket) as Player).score += points;
        this.gamePlayers?.get(this.turnSocket)?.lettersRack.removeLettersOnRack(lettersToRemove);
    }
    exchangeLetters(lettersToSwap: string): Command {
        const lettersList: string[] = lettersToSwap.split('');
        const playerRack = this.gamePlayers?.get(this.turnSocket)?.lettersRack as ChevaletService;
        const exchangeResult: Command = this.exchangeService.exchangeLettersCommand(playerRack, lettersList);
        if (exchangeResult.type === 'game') {
            this.passStreak = 0;
        }
        return exchangeResult;
    }
    reserveState(): Command {
        const reserveResult: Command = this.reserveCommandService.reserveStateCommand();
        return reserveResult;
    }

    toggleTurn() {
        if (this.socketIndexTurn + 1 === MAX_PLAYERS) this.socketIndexTurn = 0;
        else this.socketIndexTurn++;
        this.turnSocket = Array.from(this.gamePlayers.keys())[this.socketIndexTurn];
    }
    get socketTurn(): string {
        return this.turnSocket;
    }
    get boardLetters(): Letter[] {
        return this.board.allPlacedLetters;
    }

    getReserveLettersLength(): number {
        return this.reserveLetters.letterReserveSize;
    }
    getPlayersSockets() {
        return this.gamePlayers.keys();
    }

    getPlayerRack(socketId: string): string[] {
        return this.gamePlayers?.get(socketId)?.lettersRack.lettersRack as string[];
    }
    getPlayerHintWords(socketId: string): string {
        return this.gamePlayers?.get(socketId)?.hintWords.hintPlacement(this.firstTurn) as string;
    }
    getPlayerTilesLeft(socketId: string): number {
        return this.gamePlayers?.get(socketId)?.lettersRack.rackInString.length as number;
    }
    getPlayerScore(socketId: string): number {
        return this.gamePlayers?.get(socketId)?.score as number;
    }

    removeLettersRackForValidation(socketId: string, letters: Letter[]): string[] {
        const playerRack = this.getPlayerRack(socketId) as string[];
        const playerRackLettersRemoved: string[] = [];
        playerRack.forEach((rackLetter, i) => {
            for (const letter of letters) {
                if (rackLetter === letter.value || (letter.value.toUpperCase() === letter.value && rackLetter === '*')) {
                    letters.splice(letters.indexOf(letter), 1);
                    playerRackLettersRemoved.push('');
                    break;
                }
            }
            if (playerRackLettersRemoved.length !== i + 1) playerRackLettersRemoved.push(rackLetter);
        });
        return playerRackLettersRemoved;
    }
    gameEnded(): boolean {
        const turnPlayer: Player = this.gamePlayers.get(this.turnSocket) as Player;
        let gameEnd = false;
        if (this.passStreak === PASS_MAX_STREAK) {
            gameEnd = true;
            for (const playerSocket of this.gamePlayers.keys()) {
                const player: Player = this.gamePlayers.get(playerSocket) as Player;
                const playerRackPoints = player.lettersRack.calculateRackPoints();
                player.score -= playerRackPoints;
            }
        } else if (turnPlayer.lettersRack.isRackEmpty() && this.reserveLetters.letterReserveSize === 0) {
            gameEnd = true;
            for (const playerSocket of this.gamePlayers.keys()) {
                if (playerSocket !== this.turnSocket) {
                    const player: Player = this.gamePlayers.get(playerSocket) as Player;
                    const playerRackPoints = player.lettersRack.calculateRackPoints();
                    player.score -= playerRackPoints;
                    turnPlayer.score += playerRackPoints;
                }
            }
        }
        return gameEnd;
    }
    gameEndedMessage(): string[] {
        const playersRacks: string[] = [];
        for (const playerSocket of this.gamePlayers.keys()) {
            const rackTurnLetters: string = (this.gamePlayers?.get(playerSocket)?.lettersRack as ChevaletService).rackInString;
            playersRacks.push(playerSocket);
            playersRacks.push(rackTurnLetters);
        }
        return playersRacks;
    }
    // transformToSoloGame(scrabbleSoloGame: ScrabbleClassicSolo, soloGame: SoloGame): ScrabbleClassicSolo {
    //     scrabbleSoloGame.passStreak = this.passStreak;
    //     scrabbleSoloGame.firstTurn = this.firstTurn;
    //     scrabbleSoloGame.board = this.board;
    //     scrabbleSoloGame.validationCountWords = this.validationCountWords;
    //     scrabbleSoloGame.exchangeService = this.exchangeService;
    //     scrabbleSoloGame.reserveLetters = this.reserveLetters;
    //     scrabbleSoloGame.reserveCommandService = this.reserveCommandService;
    //     scrabbleSoloGame.modeLog = this.modeLog;
    //     scrabbleSoloGame.counterPlayer = this.counterPlayer;
    //     for (const socketId of this.gamePlayers.keys()) {
    //         if (socketId === soloGame.hostID) {
    //             scrabbleSoloGame.gamePlayers.set(socketId, this.gamePlayers.get(socketId) as Player);
    //             scrabbleSoloGame.counterPlayer.set(socketId, this.counterPlayer.get(socketId) as ScrabbleLog2990);
    //         } else {
    //             scrabbleSoloGame.gamePlayers.set(soloGame.virtualPlayerName, this.gamePlayers.get(socketId) as Player);
    //             scrabbleSoloGame.counterPlayer.set(soloGame.virtualPlayerName, this.counterPlayer.get(socketId) as ScrabbleLog2990);
    //         }
    //         if (this.socketTurn !== soloGame.hostID) scrabbleSoloGame.turnSocket = soloGame.virtualPlayerName;
    //     }
    //     return scrabbleSoloGame;
    // }
    get notTurnSockets(): string[] {
        const notTurnSockets: string[] = [];
        for (const socketId of this.gamePlayers.keys())
            if (socketId !== this.socketTurn) {
                notTurnSockets.push(socketId);
                break;
            }
        return notTurnSockets;
    }
    incrementStreakPass() {
        this.passStreak++;
    }
}
