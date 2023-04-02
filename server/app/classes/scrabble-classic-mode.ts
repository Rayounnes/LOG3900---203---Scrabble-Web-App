import { Board } from './board';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';
import { Letter } from '@app/interfaces/lettre';
import { Player } from './player';
import { ReserveService } from '@app/services/reserve.service';
import { ChevaletService } from '@app/services/chevalet.service';
import { ReserveCommandService } from '@app/services/reserve-command.service';
import { Command } from '@app/interfaces/command';
import { RandomPlayerChoices } from '@app/services/random-player-choices.service';
import { COMMANDS, LEVEL, POINTS } from '@app/constants/constants';
import { Placement } from '@app/interfaces/placement';
import { INVALID_PLACEMENT } from '@app/constants/hint-constants';
import { GamePlayerInfos } from '@app/interfaces/game-player-infos';

// const PASS_MAX_STREAK = 6;
const MAX_PLAYERS = 4;
export class ScrabbleClassicMode {
    protected board;
    protected validationCountWords;
    protected exchangeService;
    protected firstTurn: boolean = true;
    protected gamePlayers: Map<string, Player> = new Map();
    protected turnSocket;
    protected turnPlayers: string[];
    protected socketIndexTurn;
    protected reserveLetters;
    protected passStreak;
    protected isGameEnded: boolean;
    protected passMaxStreak: number;
    protected reserveCommandService;
    protected playersUsernames: Map<string, string>;
    protected playersSockets: string[]; // Liste des sockets des joeurs humains
    protected observersSockets: string[]; // Liste des sockets des observateurs
    protected virtualPlayers: string[]; // Liste des noms des joeurs virtuels
    // joueurs virtuels
    private randomVirtualChoices;
    private playerDifficulty: string;
    constructor(
        playersSockets: string[],
        observersSockets: string[],
        virtualPlayers: string[],
        playerUsernames: Map<string, string>,
        fileName: string,
    ) {
        this.turnSocket = playersSockets[0];
        this.playersSockets = playersSockets;
        this.observersSockets = observersSockets;
        this.playersUsernames = playerUsernames;
        this.socketIndexTurn = 0;
        this.board = new Board();
        this.passStreak = 0;
        // Pass max streak atteint qd tous les joueurs humains passent leur tours 2 fois de suite
        this.passMaxStreak = playersSockets.length * 2;
        this.validationCountWords = new ValidationCountingWordsService(this.board, fileName);
        this.reserveLetters = new ReserveService();
        this.exchangeService = new ExchangeLettersService(this.reserveLetters);
        this.reserveCommandService = new ReserveCommandService(this.reserveLetters);
        // turn players: liste des sockets des joueurs et nom des JV pour modifier facilement le nom d'un joueur
        // lorsqu'il abandonne
        this.turnPlayers = [];
        for (const playerSocket of playersSockets) {
            this.gamePlayers.set(playerSocket, new Player(this.reserveLetters, this.board, this.validationCountWords));
            this.turnPlayers.push(playerSocket);
        }
        // Virtual players
        for (const virtualPlayer of virtualPlayers) {
            this.gamePlayers.set(virtualPlayer, new Player(this.reserveLetters, this.board, this.validationCountWords));
            this.turnPlayers.push(virtualPlayer);
        }
        this.virtualPlayers = virtualPlayers;
        this.randomVirtualChoices = new RandomPlayerChoices();
        this.playerDifficulty = LEVEL.Expert;
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
        const points = this.validationCountWords.verifyAndCalculateWords(letters);
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
        this.turnSocket = this.turnPlayers[this.socketIndexTurn];
    }
    get socketTurn(): string {
        return this.turnSocket;
    }
    get humansPlayerInGame(): number {
        return this.playersSockets.length;
    }
    get boardLetters(): Letter[] {
        return this.board.allPlacedLetters;
    }
    get isClassicMode(): boolean {
        return true;
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
    getPlayerHintWords(socketId: string): Placement[] {
        const placements = this.gamePlayers?.get(socketId)?.hintWords.getBestHints(this.firstTurn) as Placement[];
        return placements;
    }
    getPlayerTilesLeft(socketId: string): number {
        return this.gamePlayers?.get(socketId)?.lettersRack.rackInString.length as number;
    }
    getPlayerScore(socketId: string): number {
        return this.gamePlayers?.get(socketId)?.score as number;
    }
    getPlayersInfo(): GamePlayerInfos[] {
        const playersInfos: GamePlayerInfos[] = [];
        for (const playerSocket of this.turnPlayers) {
            const playerDetails = {
                username: this.playersUsernames.get(playerSocket),
                points: this.getPlayerScore(playerSocket),
                isVirtualPlayer: this.virtualPlayers.includes(playerSocket),
                tiles: this.getPlayerRack(playerSocket),
                tilesLeft: this.getPlayerTilesLeft(playerSocket),
                socket: playerSocket,
            } as GamePlayerInfos;
            playersInfos.push(playerDetails);
        }
        return playersInfos;
    }
    get observers(): string[] {
        return this.observersSockets;
    }
    setObserver(isAdd: boolean, observerSocketId: string) {
        if (isAdd) {
            this.observersSockets.push(observerSocketId);
        } else {
            // On enleve le joueur humain des players sockets et recalcule le passMaxStreak
            const indexObserverSocket = this.observersSockets.indexOf(observerSocketId);
            if (indexObserverSocket > -1) {
                this.observersSockets.splice(indexObserverSocket, 1);
                console.log("OBSERVEUR SUPPRIMé")
            }
        }
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
        if (this.passStreak === this.passMaxStreak) {
            gameEnd = true;
            // On enleve les points du chevalet au score de chaque joueur
            for (const playerSocket of this.gamePlayers.keys()) {
                const player: Player = this.gamePlayers.get(playerSocket) as Player;
                const playerRackPoints = player.lettersRack.calculateRackPoints();
                player.score -= playerRackPoints;
            }
        } else if (turnPlayer.lettersRack.isRackEmpty() && this.reserveLetters.letterReserveSize === 0) {
            gameEnd = true;
            // On ajoute les points des chevalets des perdants au score du gagnant
            for (const playerSocket of this.gamePlayers.keys()) {
                if (playerSocket !== this.turnSocket) {
                    const player: Player = this.gamePlayers.get(playerSocket) as Player;
                    const playerRackPoints = player.lettersRack.calculateRackPoints();
                    player.score -= playerRackPoints;
                    turnPlayer.score += playerRackPoints;
                }
            }
        }
        this.isGameEnded = gameEnd;
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
    abandonPlayer(abandonPlayerSocket: string): string {
        const playerGame = this.gamePlayers.get(abandonPlayerSocket) as Player;
        const newVirtualPlayerName = `Bot ${this.virtualPlayers.length + 1}`;
        this.virtualPlayers.push(newVirtualPlayerName);
        this.playersUsernames.set(newVirtualPlayerName, newVirtualPlayerName);
        // modifier la liste de tours en inserant le nouveau JV
        const index = this.turnPlayers.indexOf(abandonPlayerSocket);
        this.turnPlayers[index] = newVirtualPlayerName;
        this.gamePlayers.delete(abandonPlayerSocket);
        this.gamePlayers.set(newVirtualPlayerName, playerGame);
        // On enleve le joueur humain des players sockets et recalcule le passMaxStreak
        const indexPlayerSocket = this.playersSockets.indexOf(abandonPlayerSocket);
        if (indexPlayerSocket > -1) {
            this.playersSockets.splice(indexPlayerSocket, 1);
        }
        this.passMaxStreak = this.playersSockets.length * 2;
        // Si le joueur abandonne pendant la suite de passer son tour on lui enleve son passer
        if (this.passStreak !== 0) this.passStreak--;
        if (this.turnSocket === abandonPlayerSocket) this.turnSocket = newVirtualPlayerName;
        return newVirtualPlayerName;
    }
    get notTurnSockets(): string[] {
        const notTurnSockets: string[] = [];
        for (const socketId of this.gamePlayers.keys())
            if (socketId !== this.socketTurn) {
                notTurnSockets.push(socketId);
            }
        return notTurnSockets;
    }
    incrementStreakPass() {
        this.passStreak++;
    }

    // Virtual player behavior
    findPlacement(): Placement {
        let placement: Placement;
        let pointsWanted: POINTS;
        let choices: Placement[];
        let randomChoice: number;
        switch (this.playerDifficulty) {
            case LEVEL.Beginner:
                pointsWanted = this.randomVirtualChoices.randomPlaceChoices();
                choices = this.gamePlayers.get(this.turnSocket)?.hintWords.getAllWordsInPointsScale(this.firstTurn, pointsWanted) as Placement[];
                if (choices.length === 0) return INVALID_PLACEMENT;
                randomChoice = Math.floor((choices.length - 1) * Math.random());
                placement = choices[randomChoice];
                break;
            case LEVEL.Expert:
                // this.turnSocket sera le nom du joeur virtuel
                placement = this.gamePlayers.get(this.turnSocket)?.hintWords.getMostPointsPlacement(this.firstTurn) as Placement;
                if (placement.points === 0) return INVALID_PLACEMENT;
                break;
            default:
                placement = INVALID_PLACEMENT;
        }
        return placement;
    }
    placeWordVirtual(): Placement {
        const placement: Placement = this.findPlacement();
        if (placement.points === 0) return INVALID_PLACEMENT;
        this.board.placeLetters(placement.letters as Letter[]);
        this.pointsUpdate(
            placement.points,
            placement.letters.map((letter) => letter.value),
        );
        placement.command = this.gamePlayers.get(this.turnSocket)?.hintWords.wordToCommand(placement.letters) as string;
        return placement;
    }
    exchangeVirtualPlayer(lettersToExchange: string) {
        let exchangeResult: Command = { name: '!échanger ', type: 'game', display: 'room' };
        switch (this.playerDifficulty) {
            case LEVEL.Beginner:
                exchangeResult = this.exchangeLetters(lettersToExchange);
                break;
            case LEVEL.Expert:
                this.exchangeService.exchangeLetters(
                    this.gamePlayers?.get(this.turnSocket)?.lettersRack as ChevaletService,
                    lettersToExchange.split(''),
                );
                break;
        }
        return exchangeResult;
    }
    get lettersToExchange(): string {
        const lettersRack = this.gamePlayers.get(this.turnSocket)?.lettersRack.rackInString as string;
        let numLetters: number = this.randomVirtualChoices.randomExchangeChoices();
        if (this.getReserveLettersLength() === 0) return '';
        if (this.playerDifficulty === LEVEL.Expert) {
            if (lettersRack.length > this.getReserveLettersLength()) numLetters = this.getReserveLettersLength();
            else return lettersRack;
        }
        let letters = '';
        const lettersToPick = lettersRack.split('');
        for (let i = 0; i < numLetters; i++) {
            const indexLetter = lettersToPick.length * Math.floor(Math.random());
            const letterToPick = lettersToPick[indexLetter];
            letters = letters + letterToPick;
            lettersToPick.splice(indexLetter, 1);
        }
        return letters;
    }
    get virtualNames(): string[] {
        return this.virtualPlayers;
    }
    get isEndGame(): boolean {
        return this.isGameEnded;
    }
    get commandVirtualPlayer(): COMMANDS {
        if (this.playerDifficulty === LEVEL.Expert) return COMMANDS.Placer;
        return this.randomVirtualChoices.randomGameCommand();
    }
}
