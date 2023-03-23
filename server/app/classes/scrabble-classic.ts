import { Board } from './board';
import { Goal } from '@app/classes/goal';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';
import { Letter } from '@app/interfaces/lettre';
import { Player } from './player';
import { ReserveService } from '@app/services/reserve.service';
import { ChevaletService } from '@app/services/chevalet.service';
import { ReserveCommandService } from '@app/services/reserve-command.service';
import { Command } from '@app/interfaces/command';
import { SocketUser } from '@app/interfaces/socket-user';
import { ScrabbleLog2990 } from '@app/services/scrabble-log2990.service';
import { ScrabbleClassicSolo } from './scrabble-classic-solo';
import { SoloGame } from '@app/interfaces/solo-game';
import { HelpCommandService } from '@app/services/help-command.service';

const PASS_MAX_STREAK = 6;
export class ScrabbleClassic {
    protected isModeLog: boolean;
    protected modeLog: ScrabbleLog2990;
    protected board;
    protected validationCountWords;
    protected exchangeService;
    protected firstTurn: boolean = true;
    protected gamePlayers: Map<string, Player> = new Map();
    protected counterPlayer: Map<string, ScrabbleLog2990> = new Map();
    protected turnSocket;
    protected reserveLetters;
    protected passStreak;
    protected reserveCommandService;
    protected playerFirstSocket;
    protected playerSecondSocket;
    protected helpCommandService;
    constructor(firstPlayerSocket: string, secondPlayerSocket: string, fileName: string, isLogMode: boolean) {
        this.isModeLog = isLogMode;
        this.playerFirstSocket = firstPlayerSocket;
        this.playerSecondSocket = secondPlayerSocket;
        this.turnSocket = firstPlayerSocket;
        this.board = new Board();
        this.passStreak = 0;
        this.modeLog = new ScrabbleLog2990();
        this.validationCountWords = new ValidationCountingWordsService(this.board, fileName);
        this.reserveLetters = new ReserveService();
        this.exchangeService = new ExchangeLettersService(this.reserveLetters);
        this.reserveCommandService = new ReserveCommandService(this.reserveLetters);
        this.helpCommandService = new HelpCommandService();
        this.gamePlayers.set(firstPlayerSocket, new Player(this.reserveLetters, this.board, this.validationCountWords));
        this.gamePlayers.set(secondPlayerSocket, new Player(this.reserveLetters, this.board, this.validationCountWords));
        this.counterPlayer.set(firstPlayerSocket, new ScrabbleLog2990());
        this.counterPlayer.set(secondPlayerSocket, new ScrabbleLog2990());
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
            if (this.isModeLog) {
                points += this.getGoalsPoints(letters);
            }
            this.pointsUpdate(points, stringLetters);
        }
        return points;
    }
    getGoalsPoints(letters: Letter[]): number {
        return this.validationCountWords.addGoalsPoints(letters, this.modeLog, this.counterPlayer.get(this.socketTurn) as ScrabbleLog2990);
    }

    setPrivateGoalsForPlayers() {
        (this.counterPlayer.get(this.playerFirstSocket) as ScrabbleLog2990).privateGoal = (
            this.counterPlayer.get(this.playerFirstSocket) as ScrabbleLog2990
        ).goals[this.modeLog.privateGoalsOfGame[0].id - 1];

        (this.counterPlayer.get(this.playerSecondSocket) as ScrabbleLog2990).privateGoal = (
            this.counterPlayer.get(this.playerSecondSocket) as ScrabbleLog2990
        ).goals[this.modeLog.privateGoalsOfGame[1].id - 1];
    }

    getPrivateGoal(playerId: string): Goal {
        return (this.counterPlayer.get(playerId) as ScrabbleLog2990).privateGoal;
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
            this.changeExchangeCounter();
        }
        return exchangeResult;
    }
    reserveState(): Command {
        const reserveResult: Command = this.reserveCommandService.reserveStateCommand();
        return reserveResult;
    }
    commandInfo(): Command {
        const helpMessage: Command = this.helpCommandService.helpCommand();
        return helpMessage;
    }
    toggleTurn() {
        for (const playerSocket of this.gamePlayers.keys()) {
            if (playerSocket !== this.turnSocket) {
                this.turnSocket = playerSocket;
                break;
            }
        }
    }
    changeSocket(userSocket: SocketUser) {
        if (this.turnSocket === userSocket.oldSocketId) this.turnSocket = userSocket.newSocketId;
        const player = this.gamePlayers.get(userSocket.oldSocketId) as Player;
        this.gamePlayers.set(userSocket.newSocketId, player);
        this.gamePlayers.delete(userSocket.oldSocketId);
    }
    get socketTurn(): string {
        return this.turnSocket;
    }
    get boardLetters(): Letter[] {
        return this.board.allPlacedLetters;
    }
    get logMode(): boolean {
        return this.isModeLog;
    }
    getReserveLettersLength(): number {
        return this.reserveLetters.letterReserveSize;
    }
    getPublicGoals(): Goal[] {
        return this.modeLog.goalsOfTheGame;
    }
    changeExchangeCounter() {
        (this.counterPlayer?.get(this.turnSocket) as ScrabbleLog2990).resetExchange();
        this.modeLog.cptExchange = 0;
    }
    getExchangeCounter(): number {
        return this.modeLog.cptExchange;
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
        const opponentPlayer: Player = this.gamePlayers.get(this.notTurnSocket) as Player;
        let gameEnd = false;
        const opponentRackPoints = opponentPlayer.lettersRack.calculateRackPoints();
        if (this.passStreak === PASS_MAX_STREAK) {
            gameEnd = true;
            const turnPlayerRackPoints = turnPlayer.lettersRack.calculateRackPoints();
            turnPlayer.score -= turnPlayerRackPoints;
            opponentPlayer.score -= opponentRackPoints;
        } else if (turnPlayer.lettersRack.isRackEmpty() && this.reserveLetters.letterReserveSize === 0) {
            gameEnd = true;
            turnPlayer.score += opponentRackPoints;
            opponentPlayer.score -= opponentRackPoints;
        }
        return gameEnd;
    }
    gameEndedMessage(): string[] {
        const rackTurnLetters: string = (this.gamePlayers?.get(this.turnSocket)?.lettersRack as ChevaletService).rackInString;
        const rackNotTurnLetters: string = (this.gamePlayers?.get(this.notTurnSocket)?.lettersRack as ChevaletService).rackInString;
        return [this.socketTurn, rackTurnLetters, this.notTurnSocket, rackNotTurnLetters];
    }
    transformToSoloGame(scrabbleSoloGame: ScrabbleClassicSolo, soloGame: SoloGame): ScrabbleClassicSolo {
        scrabbleSoloGame.passStreak = this.passStreak;
        scrabbleSoloGame.firstTurn = this.firstTurn;
        scrabbleSoloGame.board = this.board;
        scrabbleSoloGame.validationCountWords = this.validationCountWords;
        scrabbleSoloGame.exchangeService = this.exchangeService;
        scrabbleSoloGame.reserveLetters = this.reserveLetters;
        scrabbleSoloGame.reserveCommandService = this.reserveCommandService;
        scrabbleSoloGame.modeLog = this.modeLog;
        scrabbleSoloGame.counterPlayer = this.counterPlayer;
        for (const socketId of this.gamePlayers.keys()) {
            if (socketId === soloGame.hostID) {
                scrabbleSoloGame.gamePlayers.set(socketId, this.gamePlayers.get(socketId) as Player);
                scrabbleSoloGame.counterPlayer.set(socketId, this.counterPlayer.get(socketId) as ScrabbleLog2990);
            } else {
                scrabbleSoloGame.gamePlayers.set(soloGame.virtualPlayerName, this.gamePlayers.get(socketId) as Player);
                scrabbleSoloGame.counterPlayer.set(soloGame.virtualPlayerName, this.counterPlayer.get(socketId) as ScrabbleLog2990);
            }
            if (this.socketTurn !== soloGame.hostID) scrabbleSoloGame.turnSocket = soloGame.virtualPlayerName;
        }
        return scrabbleSoloGame;
    }
    get notTurnSocket(): string {
        let notTurnSocket = '';
        for (const socketId of this.gamePlayers.keys())
            if (socketId !== this.socketTurn) {
                notTurnSocket = socketId;
                break;
            }
        return notTurnSocket;
    }
    incrementStreakPass() {
        this.passStreak++;
    }
}
