import * as reserveConstants from '@app/constants/reserve-constants';
import { Service } from 'typedi';

const NUMB_LETTERS_RESERVE = 102;
@Service()
export class ReserveService {
    listLetters = ['b', 'c', 'f', 'g', 'h', 'j', 'k', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '*'];
    numberLettersTwo = ['b', 'c', 'f', 'g', 'h', 'p', 'v', '*'];
    numberLettersOne = ['j', 'k', 'q', 'w', 'x', 'y', 'z'];
    reserve = new Map<string, number>([]);
    constantReserve = new reserveConstants.ReserveConstants();
    letterReserveSize: number;

    constructor() {
        this.letterReserveSize = NUMB_LETTERS_RESERVE;
        this.reserve.set('a', this.constantReserve.nineLeft);
        this.reserve.set('d', this.constantReserve.threeLeft);
        this.reserve.set('m', this.constantReserve.threeLeft);
        this.reserve.set('e', this.constantReserve.fifteenLeft);
        this.reserve.set('i', this.constantReserve.eightLeft);
        this.reserve.set('l', this.constantReserve.fiveLeft);
        for (const lettre of this.listLetters) {
            if (this.numberLettersTwo.includes(lettre)) {
                this.reserve.set(lettre, this.constantReserve.twoLeft);
            } else if (this.numberLettersOne.includes(lettre)) {
                this.reserve.set(lettre, this.constantReserve.oneLeft);
            } else {
                this.reserve.set(lettre, this.constantReserve.sixLeft);
            }
        }
    }

    removeLetter(letter: string) {
        const value = this.reserve.get(letter);
        this.reserve.set(letter, Number(value) - 1);
        this.letterReserveSize--;
    }
    getLettersArray(nbOfLetters: number): string[] {
        const newLetters: string[] = [];
        for (let i = 0; i < nbOfLetters; ++i) {
            const newLetter = this.getLetter();
            if (newLetter) {
                newLetters.push(newLetter);
            }
        }
        return newLetters;
    }
    getLetter(): string {
        if (this.letterReserveSize === 0) return '';
        const letterReserve = this.getFullLetterReserve();
        const randomIndexLetter = Math.floor(Math.random() * letterReserve.length);
        const randomLetter = letterReserve[randomIndexLetter];
        this.removeLetter(randomLetter);
        return randomLetter as string;
    }

    addLetterToReserve(letter: string): void {
        this.reserve.set(letter, (this.reserve.get(letter) as number) + 1);
        this.letterReserveSize++;
    }

    getFullLetterReserve() {
        const fullLetterReserve = [];
        for (const [letter, quantity] of this.reserve.entries()) {
            for (let i = 0; i < quantity; i++) fullLetterReserve.push(letter);
        }
        return fullLetterReserve;
    }
}
