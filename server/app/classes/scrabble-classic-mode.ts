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
    protected socketIndexTurn;
    protected reserveLetters;
    protected passStreak;
    protected isGameEnded: boolean;
    protected passMaxStreak: number;
    protected reserveCommandService;
    protected playersUsernames: Map<string, string>;
    protected playersSockets: string[]; // Liste des sockets des joeurs humains
    protected virtualPlayers: string[]; // Liste des noms des joeurs virtuels
    // joueurs virtuels
    private randomVirtualChoices;
    private playerDifficulty: string;
    constructor(playersSockets: string[], virtualPlayers: string[], playerUsernames: Map<string, string>, fileName: string) {
        this.turnSocket = playersSockets[0];
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
        for (const playerSocket of playersSockets)
            this.gamePlayers.set(playerSocket, new Player(this.reserveLetters, this.board, this.validationCountWords));
        // Virtual players
        for (const virtualPlayer of virtualPlayers)
            this.gamePlayers.set(virtualPlayer, new Player(this.reserveLetters, this.board, this.validationCountWords));
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
    getPlayersInfo(): GamePlayerInfos[] {
        const playersInfos: GamePlayerInfos[] = [];
        for (const playerSocket of this.getPlayersSockets()) {
            const playerDetails = {
                username: this.playersUsernames.get(playerSocket),
                points: this.getPlayerScore(playerSocket),
                isVirtualPlayer: this.virtualPlayers.includes(playerSocket),
                tiles: this.getPlayerTilesLeft(playerSocket),
                socket : playerSocket
            } as GamePlayerInfos;
            playersInfos.push(playerDetails);
        }
        return playersInfos;
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

    // Virtual player behaviour
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
    get commandVirtualPlayer(): COMMANDS {
        if (this.playerDifficulty === LEVEL.Expert) return COMMANDS.Placer;
        return this.randomVirtualChoices.randomGameCommand();
    }
}
