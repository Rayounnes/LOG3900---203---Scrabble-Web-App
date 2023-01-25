import { ScrabbleClassic } from './scrabble-classic';
import { RandomPlayerChoices } from '@app/services/random-player-choices.service';
import { COMMANDS, LEVEL, POINTS } from '@app/constants/constants';
import { Placement } from '@app/interfaces/placement';
import { Letter } from '@app/interfaces/lettre';
import { INVALID_PLACEMENT } from '@app/constants/hint-constants';
import { Command } from '@app/interfaces/command';
import { ChevaletService } from '@app/services/chevalet.service';

export class ScrabbleClassicSolo extends ScrabbleClassic {
    private virtualPlayer: string;
    private hostPlayer: string;
    private playerDifficulty: string;
    private randomVirtualChoices;
    constructor(firstPlayerSocket: string, secondPlayerSocket: string, fileName: string, difficulty: string, isLogMode: boolean) {
        super(firstPlayerSocket, secondPlayerSocket, fileName, isLogMode);
        this.hostPlayer = firstPlayerSocket;
        this.virtualPlayer = secondPlayerSocket;
        this.playerDifficulty = difficulty;
        this.randomVirtualChoices = new RandomPlayerChoices();
        const players = [this.hostPlayer, this.virtualPlayer];
        const randomIndex = Math.floor(players.length * Math.random());
        this.turnSocket = players[randomIndex];
    }
    findPlacement(): Placement {
        let placement: Placement;
        let pointsWanted: POINTS;
        let choices: Placement[];
        let randomChoice: number;
        switch (this.playerDifficulty) {
            case LEVEL.Beginner:
                pointsWanted = this.randomVirtualChoices.randomPlaceChoices();
                choices = this.gamePlayers.get(this.virtualPlayer)?.hintWords.getAllWordsInPointsScale(this.firstTurn, pointsWanted) as Placement[];
                if (choices.length === 0) return INVALID_PLACEMENT;
                randomChoice = Math.floor((choices.length - 1) * Math.random());
                placement = choices[randomChoice];
                break;
            case LEVEL.Expert:
                placement = this.gamePlayers.get(this.virtualPlayer)?.hintWords.getMostPointsPlacement(this.firstTurn) as Placement;
                if (placement.points === 0) return INVALID_PLACEMENT;
                break;
            default:
                placement = INVALID_PLACEMENT;
        }
        return placement;
    }
    placeWordVirtual(): Placement {
        let gainedLog2990Points = 0;
        const placement: Placement = this.findPlacement();
        if (placement.points === 0) return INVALID_PLACEMENT;
        this.passStreak = 0;
        this.board.placeLetters(placement.letters as Letter[]);
        if (this.isModeLog) gainedLog2990Points = this.getGoalsPoints(placement.letters);
        this.pointsUpdate(
            placement.points + gainedLog2990Points,
            placement.letters.map((letter) => letter.value),
        );
        placement.command = this.gamePlayers.get(this.virtualPlayer)?.hintWords.wordToCommand(placement.letters) as string;
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
                this.passStreak = 0;
                this.changeExchangeCounter();
                break;
        }
        return exchangeResult;
    }
    get lettersToExchange(): string {
        const lettersRack = this.gamePlayers.get(this.virtualPlayer)?.lettersRack.rackInString as string;
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
    get virtualName(): string {
        return this.virtualPlayer;
    }
    get commandVirtualPlayer(): COMMANDS {
        if (this.playerDifficulty === LEVEL.Expert) return COMMANDS.Placer;
        return this.randomVirtualChoices.randomGameCommand();
    }
}
