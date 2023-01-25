import { ReserveService } from './reserve.service';
import { LETTERS_POINTS } from '@app/constants/constants';
import { Service } from 'typedi';

const START_RACK = 0;
const END_RACK = 7;
@Service()
export class ChevaletService {
    private chevalet: string[] = [];
    constructor(private reserveService: ReserveService) {}
    fillRackWithLetters() {
        for (let i = START_RACK; i < END_RACK; i++) {
            if (!this.chevalet[i]) {
                const letter = this.reserveService.getLetter();
                this.chevalet[i] = letter;
            }
        }
    }
    areLettersInRack(letters: string): boolean {
        const lettersRack: string[] = [...this.chevalet];
        for (const letter of letters) {
            if (letter.toUpperCase() === letter && lettersRack.includes('*')) lettersRack.splice(lettersRack.indexOf('*'), 1);
            else if (lettersRack.includes(letter)) lettersRack.splice(lettersRack.indexOf(letter), 1);
            else return false;
        }
        return true;
    }
    removeLettersOnRack(letters: string[]) {
        for (let i = START_RACK; i < END_RACK; i++) {
            for (const letter of letters) {
                if (this.chevalet[i] === letter || (letter.toUpperCase() === letter && this.chevalet[i] === '*')) {
                    letters.splice(letters.indexOf(letter), 1);
                    this.chevalet[i] = '';
                    break;
                }
            }
        }
        this.fillRackWithLetters();
    }
    get lettersRack() {
        return this.chevalet;
    }
    getPositionsOfLettersOnRack(letters: string[]): number[] {
        const lettersCopy: string[] = [...letters];
        const positionOfLetters: number[] = [];
        this.chevalet.forEach((rackLetter, i) => {
            for (const letter of lettersCopy) {
                if (rackLetter === letter) {
                    lettersCopy.splice(lettersCopy.indexOf(letter), 1);
                    positionOfLetters.push(i);
                    break;
                }
            }
        });
        return positionOfLetters;
    }
    isRackEmpty() {
        let empty = true;
        for (const letter of this.chevalet) {
            if (letter) {
                empty = false;
                break;
            }
        }
        return empty;
    }
    calculateRackPoints() {
        let points = 0;
        for (const letter of this.chevalet) {
            if (letter) points += LETTERS_POINTS.get(letter) as number;
        }
        return points;
    }
    get rackInString(): string {
        let rack = '';
        for (const letter of this.chevalet) {
            if (letter) rack += letter;
        }
        return rack;
    }
}
