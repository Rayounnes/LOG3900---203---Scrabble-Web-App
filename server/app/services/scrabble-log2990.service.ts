import { Board } from '@app/classes/board';
import { Goal } from '@app/classes/goal';
import { Letter } from '@app/interfaces/lettre';
import { Service } from 'typedi';
import { Word } from '@app/interfaces/word';
import { injectable } from 'inversify';
import {
    NUM_OBJ,
    NUM_VOWELS,
    LENGTH_TEN,
    POINTS_TWENTY,
    CPT_EXCHANGE_FOUR,
    NUM_MAX_TILES,
    ID,
    NAME_GOALS,
    POINT_GOALS,
} from '@app/constants/log2990-mode-constants';

@injectable()
@Service()
export class ScrabbleLog2990 {
    board: Board;
    cptObj4 = 0;
    isExchange = false;
    cptExchange = 0;
    cptTiles = 0;
    goals: Goal[] = [];
    goalsOfTheGame: Goal[] = [];
    privateGoalsOfGame: Goal[] = [];
    privateGoal: Goal;
    vowels: string[] = ['a', 'e', 'i', 'o', 'u', 'y'];
    constructor() {
        for (let i = 0; i < NUM_OBJ; i++) {
            this.goals[i] = new Goal(i + 1, NAME_GOALS[i], POINT_GOALS[i]);
        }
        this.findPublicGoalsOfGame();
        this.findPrivateGoalsOfGame();
        this.board = new Board();
    }

    verifyObjectif1(words: Word[]) {
        for (const word of words) {
            if (this.countVowels(word) >= NUM_VOWELS) {
                this.goals[0].isCompleted = true;
                return;
            }
        }
        this.goals[0].isCompleted = false;
    }

    countVowels(placement: Word) {
        let vowelCounter = 0;
        for (const value of placement.word) {
            if (this.isVowel(value)) {
                vowelCounter += 1;
            }
        }
        return vowelCounter;
    }

    isVowel(letter: string) {
        for (const vowel of this.vowels) {
            if (letter === vowel) {
                return true;
            }
        }
        return false;
    }

    verifyObjectif2(words: Word[]) {
        if (words.length >= 3) {
            this.goals[1].isCompleted = true;
            return;
        }
        this.goals[1].isCompleted = false;
    }

    verifyObjectif3(words: Word[]) {
        for (const word of words) {
            if (word.word.length === LENGTH_TEN) {
                this.goals[2].isCompleted = true;
                return;
            }
        }
        this.goals[2].isCompleted = false;
    }

    verifyObjectif4(points: number) {
        this.incrementCpt4(points);
        if (this.cptObj4 === 3) {
            this.cptObj4 = 0;
            this.goals[3].isCompleted = true;
            return;
        }
        this.goals[3].isCompleted = false;
    }

    incrementCpt4(points: number) {
        if (points >= POINTS_TWENTY) {
            this.cptObj4 += 1;
            return;
        }
        this.cptObj4 = 0;
    }

    verifyObjectif5(letters: Letter[]) {
        let letterTwo = false;
        let wordThree = false;
        for (const letter of letters) {
            if (this.verifyLetterMultiplier(letter)) letterTwo = true;
            if (this.verifyWordMultiplier(letter)) wordThree = true;
        }
        if (letterTwo && wordThree) {
            this.goals[4].isCompleted = true;
            return;
        }
        this.goals[4].isCompleted = false;
    }

    verifyWordMultiplier(letter: Letter) {
        if (this.board.getBoxIndex(letter.line, letter.column).wordMultiplicator === 3) {
            return true;
        }
        return false;
    }

    verifyLetterMultiplier(letter: Letter) {
        if (this.board.getBoxIndex(letter.line, letter.column).letterMultiplicator === 2) {
            return true;
        }
        return false;
    }

    verifyObjectif6(words: Word[]) {
        for (const word of words) {
            if (this.verifyLetterY(word) && this.verifyLetterZ(word)) {
                this.goals[5].isCompleted = true;
                return;
            }
        }
        this.goals[5].isCompleted = false;
    }

    verifyLetterY(word: Word) {
        for (const letter of word.word) {
            if (letter === 'y') {
                return true;
            }
        }
        return false;
    }

    verifyLetterZ(word: Word) {
        for (const letter of word.word) {
            if (letter === 'z') {
                return true;
            }
        }
        return false;
    }

    verifyObjectif7() {
        this.incrementExchange();
        this.isExchange = false;
        if (this.cptExchange === CPT_EXCHANGE_FOUR) {
            this.cptExchange = 0;
            this.goals[6].isCompleted = true;
            return;
        }
        this.goals[6].isCompleted = false;
    }
    resetExchange() {
        this.cptExchange = 0;
    }
    incrementExchange() {
        if (!this.isExchange) {
            this.cptExchange += 1;
        } else {
            this.cptExchange = 0;
        }
    }

    verifyObjectif8(letters: Letter[]) {
        this.cptTiles += letters.length;
        if (this.cptTiles >= NUM_MAX_TILES) {
            this.goals[7].isCompleted = true;
            return;
        }
        this.goals[7].isCompleted = false;
    }

    randomPublicGoals() {
        let randomGoal = this.goals[Math.floor(Math.random() * this.goals.length)];
        while (randomGoal.state !== '') {
            randomGoal = this.goals[Math.floor(Math.random() * this.goals.length)];
        }
        randomGoal.state = 'public';
        this.goalsOfTheGame.push(randomGoal);
    }

    randomPrivateGoals() {
        let randomGoal = this.goals[Math.floor(Math.random() * this.goals.length)];
        while (randomGoal.state === 'public' || randomGoal.state === 'private') {
            randomGoal = this.goals[Math.floor(Math.random() * this.goals.length)];
        }
        randomGoal.state = 'private';
        this.privateGoalsOfGame.push(randomGoal);
    }

    findPrivateGoalsOfGame() {
        this.randomPrivateGoals();
        this.randomPrivateGoals();
    }

    findPublicGoalsOfGame() {
        this.randomPublicGoals();
        this.randomPublicGoals();
    }

    verificationForEachGoal(id: number, words: Word[], points: number, letters: Letter[]) {
        switch (id) {
            case ID.Id1: {
                this.verifyObjectif1(words);
                break;
            }
            case ID.Id2: {
                this.verifyObjectif2(words);
                break;
            }
            case ID.Id3: {
                this.verifyObjectif3(words);
                break;
            }
            case ID.Id4: {
                this.verifyObjectif4(points);
                break;
            }
            case ID.Id5: {
                this.verifyObjectif5(letters);
                break;
            }
            case ID.Id6: {
                this.verifyObjectif6(words);
                break;
            }
            case ID.Id7: {
                this.verifyObjectif7();
                break;
            }
            case ID.Id8: {
                this.verifyObjectif8(letters);
                break;
            }
        }
    }

    verificationIsCompleted(words: Word[], points: number, letters: Letter[]) {
        this.verificationForEachGoal(this.goalsOfTheGame[0].id, words, points, letters);
        this.verificationForEachGoal(this.goalsOfTheGame[1].id, words, points, letters);
        this.verificationForEachGoal(this.privateGoal.id, words, points, letters);
    }
}
