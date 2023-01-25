import { START_INDEX_BOARD, HALF_INDEX_BOARD, END_INDEX_BOARD } from '@app/constants/constants';
import { assert, expect } from 'chai';
import { Board } from './board';
import { Tile } from './tile';
import { Letter } from '@app/interfaces/lettre';
describe('Board', () => {
    let gameBoard: Board;

    beforeEach(async () => {
        gameBoard = new Board();
    });

    it('getBox is created', () => {
        assert.isDefined(gameBoard);
    });

    it('getBox of should return a Tile', () => {
        const centerSquare: Tile = gameBoard.getBoxIndex(HALF_INDEX_BOARD, HALF_INDEX_BOARD);
        expect(centerSquare.wordMultiplicator).to.eql(2);
    });

    it(' of should return a Tile', () => {
        const tile = new Tile(1, 3);
        const centerSquare: Tile = gameBoard.getBoxIndex(START_INDEX_BOARD, START_INDEX_BOARD);
        expect(tile).to.eql(centerSquare);
    });

    it('getBoxIndex of centerSquare should return a Tile with letterMultiplier of 1 and wordMultiplier of 2', () => {
        const tile = new Tile(1, 2);
        const centerSquare: Tile = gameBoard.getBoxIndex(HALF_INDEX_BOARD, HALF_INDEX_BOARD);
        expect(tile).to.eql(centerSquare);
    });

    it('getBoxIndex of a normal square should return a Tile with letterMultiplier of 1 and wordMultiplier of 1', () => {
        const tile = new Tile();
        const centerSquare: Tile = gameBoard.getBoxIndex(0, 2);
        expect(tile).to.eql(centerSquare);
    });
    it('getBoxIndex of a normal square should return a Tile with letterMultiplier of 1 and wordMultiplier of 3', () => {
        const tile = new Tile(1, 3);
        const centerSquare: Tile = gameBoard.getBoxIndex(END_INDEX_BOARD, END_INDEX_BOARD);
        expect(tile).to.eql(centerSquare);
    });
    it('findLettersPosition should find the positions of letter when a word is between the letters when placed horizontally', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 2, column: 8 },
            { value: 'i', line: 2, column: 9 },
            { value: 'd', line: 2, column: 10 },
        ];
        const expectedLettersPositions: Letter[] = [
            { value: 'v', line: 2, column: 6 },
            { value: 'a', line: 2, column: 7 },
            { value: 'e', line: 2, column: 11 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 2;
        const columnStart = 6;
        const lettersPosition: Letter[] = gameBoard.findLettersPosition(lineStart, columnStart, letters, 'h');
        expect(lettersPosition).to.eql(expectedLettersPositions);
    });
    it('findLettersPosition should find the positions of letter when a word is between the letters when placed vertically', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 2, column: 8 },
            { value: 'i', line: 3, column: 8 },
            { value: 'd', line: 4, column: 8 },
        ];
        const expectedLettersPositions: Letter[] = [
            { value: 'v', line: 0, column: 8 },
            { value: 'a', line: 1, column: 8 },
            { value: 'e', line: 5, column: 8 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 0;
        const columnStart = 8;
        const lettersPosition: Letter[] = gameBoard.findLettersPosition(lineStart, columnStart, letters, 'v');
        expect(lettersPosition).to.eql(expectedLettersPositions);
    });
    it('areLettersAttachedAndNotOutside should find letters vertically attached and not outside the board', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 2, column: 8 },
            { value: 'i', line: 3, column: 8 },
            { value: 'd', line: 4, column: 8 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 0;
        const columnStart = 8;
        expect(gameBoard.areLettersAttachedAndNotOutside(lineStart, columnStart, letters, 'v')).to.eql(true);
    });
    it('areLettersAttachedAndNotOutside should find letters horizontally attached and not outside the board', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 3, column: 4 },
            { value: 'i', line: 3, column: 6 },
            { value: 'd', line: 3, column: 7 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 3;
        const columnStart = 3;
        expect(gameBoard.areLettersAttachedAndNotOutside(lineStart, columnStart, letters, 'h')).to.eql(true);
    });
    it('areLettersAttachedAndNotOutside should find letters attached but outside the board', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 11, column: 8 },
            { value: 'i', line: 12, column: 8 },
            { value: 'd', line: 13, column: 8 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 10;
        const columnStart = 8;
        expect(gameBoard.areLettersAttachedAndNotOutside(lineStart, columnStart, letters, 'v')).to.eql(false);
    });
    it('areLettersAttachedAndNotOutside should not find letters attached', () => {
        const startLetters: Letter[] = [
            { value: 'l', line: 11, column: 8 },
            { value: 'i', line: 12, column: 8 },
            { value: 'd', line: 13, column: 8 },
        ];
        gameBoard.placeLetters(startLetters);
        const letters = 'vae';
        const lineStart = 7;
        const columnStart = 8;
        expect(gameBoard.areLettersAttachedAndNotOutside(lineStart, columnStart, letters, 'v')).to.eql(false);
    });
    it('areLettersInCenterOfBoard should not find letters in center when one letter not in H8', () => {
        const letters = 'vae';
        const lineStart = 7;
        const columnStart = 8;
        expect(gameBoard.areLettersInCenterOfBoard(lineStart, columnStart, letters, 'v')).to.eql(false);
    });
    it('areLettersInCenterOfBoard should find letters in center when one letter in H8', () => {
        const letters = 'vae';
        const lineStart = 7;
        const columnStart = 5;
        expect(gameBoard.areLettersInCenterOfBoard(lineStart, columnStart, letters, 'h')).to.eql(true);
    });
    it('areLettersInCenterOfBoard should find letters in center when one letter in H8 but return false if letters are outside the board', () => {
        const letters = 'abcdefgiht';
        const lineStart = 7;
        const columnStart = 7;
        expect(gameBoard.areLettersInCenterOfBoard(lineStart, columnStart, letters, 'h')).to.eql(false);
    });
    it('isFirstLetterOnALetter should return true if a letter is already in the start position', () => {
        const startLetters: Letter[] = [{ value: 'l', line: 7, column: 7 }];
        gameBoard.placeLetters(startLetters);
        const lineStart = 7;
        const columnStart = 7;
        expect(gameBoard.isFirstLetterOnALetter(lineStart, columnStart)).to.eql(true);
    });
    it('isFirstLetterOnALetter should return false if no letter is in the start position', () => {
        const startLetters: Letter[] = [{ value: 'l', line: 7, column: 8 }];
        gameBoard.placeLetters(startLetters);
        const lineStart = 7;
        const columnStart = 7;
        expect(gameBoard.isFirstLetterOnALetter(lineStart, columnStart)).to.eql(false);
    });
    it('isFirstLetterOnALetter should return false if no letter is in the start position', () => {
        const lettersInBoard: Letter[] = [
            { value: 'v', line: 0, column: 8 },
            { value: 'a', line: 1, column: 8 },
            { value: 'l', line: 2, column: 8 },
            { value: 'i', line: 3, column: 8 },
            { value: 'd', line: 4, column: 8 },
            { value: 'e', line: 5, column: 8 },
        ];
        gameBoard.placeLetters(lettersInBoard);
        expect(gameBoard.allPlacedLetters).to.eql(lettersInBoard);
    });
});
