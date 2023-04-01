import { Board } from './board';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';
import { Letter } from '@app/interfaces/lettre';
import { Player } from './player';
import { ReserveService } from '@app/services/reserve.service';
import { ChevaletService } from '@app/services/chevalet.service';
import { ReserveCommandService } from '@app/services/reserve-command.service';
import { Command } from '@app/interfaces/command';
import { GamePlayerInfos } from '@app/interfaces/game-player-infos';
import { CooperativeAction } from '@app/interfaces/cooperative-action';

// const PASS_MAX_STREAK = 6;
// const MAX_PLAYERS = 4;
export class ScrabbleCooperativeMode {
    protected board;
    protected validationCountWords;
    protected exchangeService;
    protected firstTurn: boolean = true;
    protected gamePlayer: Player;
    protected reserveLetters;
    protected passStreak;
    protected isGameEnded: boolean;
    protected passMaxStreak: number;
    protected reserveCommandService;
    protected cooperativeAction: CooperativeAction;
    protected playersUsernames: Map<string, string>;
    protected playersSockets: string[]; // Liste des sockets des joeurs humains
    protected observersSockets: string[]; // Liste des sockets des observateurs

    constructor(playersSockets: string[], observersSockets: string[], playerUsernames: Map<string, string>, fileName: string) {
        this.playersSockets = playersSockets;
        this.observersSockets = observersSockets;
        this.playersUsernames = playerUsernames;
        this.board = new Board();
        this.passStreak = 0;
        // Pass max streak atteint qd tous les joueurs humains passent leur tours 2 fois de suite
        this.passMaxStreak = 2;
        this.validationCountWords = new ValidationCountingWordsService(this.board, fileName);
        this.reserveLetters = new ReserveService();
        this.exchangeService = new ExchangeLettersService(this.reserveLetters);
        this.reserveCommandService = new ReserveCommandService(this.reserveLetters);
        this.gamePlayer = new Player(this.reserveLetters, this.board, this.validationCountWords);
    }

    verifyPlaceCommand(lineN: number, columnN: number, letters: string, wordDirection: string): Letter[] | string {
        let validation = false;
        if (!this.gamePlayer.lettersRack.areLettersInRack(letters))
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
        const points = this.validationCountWords.verifyAndCalculateWords(letters);
        const stringLetters: string[] = letters.map((letter) => letter.value);
        if (points !== 0) {
            this.pointsUpdate(points, stringLetters);
        }
        return points;
    }

    pointsUpdate(points: number, lettersToRemove: string[]) {
        if (this.firstTurn) this.firstTurn = false;
        this.gamePlayer.score += points;
        this.gamePlayer.lettersRack.removeLettersOnRack(lettersToRemove);
    }
    exchangeLetters(lettersToSwap: string): Command {
        const lettersList: string[] = lettersToSwap.split('');
        const playerRack = this.gamePlayer.lettersRack as ChevaletService;
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
    getPlacementWord(letters: Letter[]): string {
        return this.gamePlayer.hintWords.wordToCommand(letters) as string;
    }
    setCooperativeAction(cooperativeAction: CooperativeAction) {
        this.cooperativeAction = cooperativeAction;
    }
    getCooperativeAction(): CooperativeAction {
        return this.cooperativeAction;
    }
    get humansPlayerInGame(): number {
        return this.playersSockets.length;
    }
    get boardLetters(): Letter[] {
        return this.board.allPlacedLetters;
    }
    get observers(): string[] {
        return this.observersSockets;
    }
    get socketTurn(): string {
        return '';
    }
    setObserver(isAdd: boolean, observerSocketId: string) {
        if (isAdd) {
            this.observersSockets.push(observerSocketId);
        } else {
            // On enleve l'observateur qui a quitté la partie
            const indexObserverSocket = this.observersSockets.indexOf(observerSocketId);
            if (indexObserverSocket > -1) {
                this.observersSockets.splice(indexObserverSocket, 1);
            }
        }
    }
    notPlayerSockets(playerSocketId: string): string[] {
        const notSockets: string[] = [];
        for (const socketId of this.playersSockets)
            if (socketId !== playerSocketId) {
                notSockets.push(socketId);
            }
        return notSockets;
    }
    get isClassicMode(): boolean {
        return false;
    }
    getReserveLettersLength(): number {
        return this.reserveLetters.letterReserveSize;
    }
    getPlayersSockets() {
        return this.playersSockets;
    }

    getPlayerRack(): string[] {
        return this.gamePlayer.lettersRack.lettersRack as string[];
    }
    getPlayerHintWords(): string {
        return this.gamePlayer.hintWords.hintPlacement(this.firstTurn) as string;
    }
    getPlayerTilesLeft(): number {
        return this.gamePlayer.lettersRack.rackInString.length as number;
    }
    getPlayerScore(): number {
        return this.gamePlayer.score as number;
    }
    getPlayersInfo(): GamePlayerInfos[] {
        const playersInfos: GamePlayerInfos[] = [];
        for (const playerSocket of this.playersSockets) {
            const playerDetails = {
                username: this.playersUsernames.get(playerSocket),
                points: this.getPlayerScore(),
                isVirtualPlayer: false,
                tiles: this.getPlayerRack(),
                tilesLeft: this.getPlayerTilesLeft(),
                socket: playerSocket,
            } as GamePlayerInfos;
            playersInfos.push(playerDetails);
        }
        return playersInfos;
    }
    removeLettersRackForValidation(socketId: string, letters: Letter[]): string[] {
        const playerRack = this.getPlayerRack() as string[];
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
        let gameEnd = false;
        if (
            this.passStreak === this.passMaxStreak ||
            (this.gamePlayer.lettersRack.isRackEmpty() && this.reserveLetters.letterReserveSize === 0) ||
            this.playersSockets.length === 1
        ) {
            gameEnd = true;
        }
        this.isGameEnded = gameEnd;
        return gameEnd;
    }
    gameEndedMessage(): string[] {
        const playersRacks: string[] = [];
        for (const playerSocket of this.playersSockets) {
            const rackTurnLetters: string = (this.gamePlayer.lettersRack as ChevaletService).rackInString;
            playersRacks.push(playerSocket);
            playersRacks.push(rackTurnLetters);
        }
        return playersRacks;
    }
    abandonPlayer(abandonPlayerSocket: string): number {
        // On enleve le joueur humain des players sockets et recalcule le passMaxStreak
        const indexPlayerSocket = this.playersSockets.indexOf(abandonPlayerSocket);
        if (indexPlayerSocket > -1) {
            this.playersSockets.splice(indexPlayerSocket, 1);
        }
        return this.playersSockets.length;
    }
    incrementStreakPass() {
        this.passStreak++;
    }
    get isEndGame(): boolean {
        return this.isGameEnded;
    }
}
