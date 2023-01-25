import { Letter } from '@app/interfaces/lettre';
import { Tile } from './tile';
import {
    DOUBLE_LETTER_POSITIONS,
    END_COLUMN_BOARD,
    HALF_INDEX_BOARD,
    END_INDEX_BOARD,
    HORIZONTAL,
    INDEX_EIGHT,
    INDEX_FOUR,
    INDEX_SIX,
    INDEX_THIRTEEN,
    INDEX_TWELVE,
    START_INDEX_BOARD,
} from '@app/constants/constants';

export class Board {
    private boardBoxes: Tile[][] = [];

    constructor() {
        this.boardBoxes = [];
        // initialisation des tuiles
        for (let i = 0; i < END_COLUMN_BOARD; i++) {
            this.boardBoxes[i] = [];
            for (let j = 0; j < END_COLUMN_BOARD; j++) this.boardBoxes[i][j] = new Tile();
        }
        this.draw();
    }
    draw() {
        this.drawDoubleLettersMiddleLineFactors();
        this.drawDoubleWords();
        this.drawTripleLetters();
        this.drawRestOfDoubleLetters();
    }
    drawDoubleLettersMiddleLineFactors() {
        // mot triple et mot double du début
        for (let i = 0; i < END_COLUMN_BOARD; i += HALF_INDEX_BOARD) {
            // lettre double
            for (let j = 3; j < INDEX_TWELVE; j += INDEX_EIGHT) {
                this.boardBoxes[i][j] = new Tile(2);
                this.boardBoxes[j][i] = new Tile(2);
            }
            for (let j = 0; j < END_COLUMN_BOARD; j += HALF_INDEX_BOARD) {
                // initialisation de la Tile du milieu
                if (i === HALF_INDEX_BOARD && j === HALF_INDEX_BOARD) this.boardBoxes[i][j] = new Tile(1, 2);
                else this.boardBoxes[i][j] = new Tile(1, 3);
            }
        }
    }
    drawDoubleWords() {
        // mot double
        let doubleWordIncrementer = 1;
        let doubleWordDecrementer = 13;
        while (doubleWordIncrementer < END_INDEX_BOARD) {
            this.boardBoxes[doubleWordIncrementer][doubleWordIncrementer] = new Tile(1, 2);
            this.boardBoxes[doubleWordIncrementer][doubleWordDecrementer] = new Tile(1, 2);
            if (doubleWordIncrementer === INDEX_FOUR) {
                doubleWordIncrementer += INDEX_SIX;
                doubleWordDecrementer -= INDEX_SIX;
            } else {
                doubleWordIncrementer++;
                doubleWordDecrementer--;
            }
        }
    }
    drawTripleLetters() {
        // lettre triple
        for (let i = 1; i < END_INDEX_BOARD; i += INDEX_FOUR) {
            for (let j = 1; j < END_INDEX_BOARD; j += INDEX_FOUR) {
                // initialisation de la Tile du milieu
                if (i === 1 || i === INDEX_THIRTEEN) if (j === 1 || j === INDEX_THIRTEEN) continue;
                this.boardBoxes[i][j] = new Tile(3);
            }
        }
    }
    drawRestOfDoubleLetters() {
        // lettre double restantes
        for (const letterPositions of DOUBLE_LETTER_POSITIONS) {
            this.boardBoxes[letterPositions.x][letterPositions.y] = new Tile(2);
            this.boardBoxes[letterPositions.y][letterPositions.x] = new Tile(2);
        }
    }
    getBoxIndex(lineIndex: number, columnIndex: number): Tile {
        return this.boardBoxes[lineIndex][columnIndex];
    }

    placeLetters(letters: Letter[]) {
        for (const letter of letters) {
            this.getBoxIndex(letter.line, letter.column).letter = letter;
            this.getBoxIndex(letter.line, letter.column).multiplicatorUsed = true;
        }
    }
    findLettersPosition(lineN: number, columnN: number, letters: string, wordDirection: string = HORIZONTAL): Letter[] {
        const lettersPosition: Letter[] = [];
        for (const letter of letters) {
            let letterPlaced = this.boardBoxes[lineN][columnN].letter.value;
            if (letterPlaced) {
                while (letterPlaced) {
                    if (wordDirection === HORIZONTAL) columnN++;
                    else lineN++;
                    letterPlaced = this.boardBoxes[lineN][columnN].letter.value;
                }
            }
            lettersPosition.push({ line: lineN, column: columnN, value: letter });
            if (wordDirection === HORIZONTAL) columnN++;
            else lineN++;
        }
        return lettersPosition;
    }
    isLetterAttached(line: number, column: number): boolean {
        const distance = 1;
        return (
            (line - distance >= START_INDEX_BOARD && this.boardBoxes[line - distance][column].letter.value !== '') ||
            (line + distance < END_COLUMN_BOARD && this.boardBoxes[line + distance][column].letter.value !== '') ||
            (column - distance >= START_INDEX_BOARD && this.boardBoxes[line][column - distance].letter.value !== '') ||
            (column + distance < END_COLUMN_BOARD && this.boardBoxes[line][column + distance].letter.value !== '')
        );
    }
    isFirstLetterOnALetter(line: number, column: number): boolean {
        return this.boardBoxes[line][column].letter.value !== '';
    }
    areLettersAttachedAndNotOutside(lineN: number, columnN: number, letters: string, wordDirection: string = HORIZONTAL): boolean {
        let isLeterAttached = false;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // nombre d'itérations sur la taille des lettres
        for (let i = 0; i < letters.length; i++) {
            let letterPlaced = this.boardBoxes[lineN][columnN].letter.value;
            if (letterPlaced) {
                isLeterAttached = true;
                while (letterPlaced) {
                    if (wordDirection === HORIZONTAL) columnN++;
                    else lineN++;
                    if (lineN > END_INDEX_BOARD || columnN > END_INDEX_BOARD) return false;
                    letterPlaced = this.boardBoxes[lineN][columnN].letter.value;
                }
            } else {
                if (this.isLetterAttached(lineN, columnN)) isLeterAttached = true;
            }
            if (wordDirection === HORIZONTAL) columnN++;
            else lineN++;
            if (i + 1 === letters.length) break;
            if (lineN > END_INDEX_BOARD || columnN > END_INDEX_BOARD) return false;
        }
        return isLeterAttached;
    }
    areLettersInCenterOfBoard(lineN: number, columnN: number, letters: string, wordDirection: string = HORIZONTAL): boolean {
        let letterInMiddle = false;
        // nombre d itérations sur la taille des lettres
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < letters.length; i++) {
            if (lineN > END_INDEX_BOARD || columnN > END_INDEX_BOARD) return false;
            else if (lineN === HALF_INDEX_BOARD && columnN === HALF_INDEX_BOARD) letterInMiddle = true;
            if (wordDirection === HORIZONTAL) columnN++;
            else lineN++;
        }
        return letterInMiddle;
    }
    get allPlacedLetters(): Letter[] {
        const allLetters: Letter[] = [];
        for (let i = 0; i < END_COLUMN_BOARD; i++) {
            for (let j = 0; j < END_COLUMN_BOARD; j++) if (this.boardBoxes[i][j].letter.value) allLetters.push(this.boardBoxes[i][j].letter);
        }
        return allLetters;
    }
}
