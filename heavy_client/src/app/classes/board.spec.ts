import { Board } from '@app/classes/board';

describe('CanvasTestHelper', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board();
    });

    it('should be created', () => {
        expect(board).toBeTruthy();
    });
    it('setColor should set a color to the tile', () => {
        board.setColor(2, 2, 'rgb(0,0,0)');
        expect(board.boardMatrix[1][1].color).toEqual('rgb(0,0,0)');
    });

    it('isTileFilled should make isFilled true', () => {
        board.isTileFilled(2, 2);
        expect(board.boardMatrix[1][1].isFilled).toBeTruthy();
    });
    it('getIsFilled should get the isFilled value', () => {
        board.isTileFilled(2, 2);
        expect(board.getIsFilled(2, 2)).toBeTruthy();
    });
    it('isNotFilled should make isFilled false', () => {
        board.isNotFilled(2, 2);
        expect(board.boardMatrix[1][1].isFilled).toBeFalsy();
    });
    it('setStartTile should set isStart to true', () => {
        board.setStartTile(2, 2);
        expect(board.boardMatrix[1][1].isStart).toBeTruthy();
    });
    it('getStartTile should get isStart value', () => {
        board.setStartTile(2, 2);
        expect(board.getStartTile()).toBeTruthy();
    });
    it('getStartTile should return undefined if there is no starting tile', () => {
        expect(board.getStartTile()).toBe(undefined);
    });
    it('getDirection should return the direction', () => {
        board.boardMatrix[2][2].direction = 'h';
        expect(board.getDirection({ x: 2, y: 2 })).toBe('h');
    });

    it('changeDirection should set a new direction', () => {
        board.changeDirection({ x: 2, y: 2 }, 'v');
        expect(board.getDirection({ x: 2, y: 2 })).toBe('v');
    });

    it('resetStartTile should put the start to false', () => {
        board.setStartTile(3, 3);
        board.resetStartTile();
        expect(board.boardMatrix[2][2].isStart).toBeFalsy();
    });

    it('setLetter should set a letter in the given position', () => {
        board.setLetter(2, 2, 'A');
        expect(board.boardMatrix[1][1].letter).toEqual('A');
    });

    it('getColor should return a color ', () => {
        board.setColor(2, 2, 'rgb(0,0,0)');
        expect(board.getColor(2, 2)).toEqual('rgb(0,0,0)');
    });

    it('isFilledForEachLetter should set the position of every letter to True ', () => {
        const letters = [
            { line: 1, column: 1, value: '' },
            { line: 1, column: 2, value: '' },
        ];
        board.isFilledForEachLetter(letters);
        expect(board.boardMatrix[1][1].isFilled).toBeTruthy();
        expect(board.boardMatrix[1][2].isFilled).toBeTruthy();
    });
    it('setLetterForEachLetters should set a value of the letter for every positions', () => {
        const letters = [
            { line: 1, column: 1, value: 'A' },
            { line: 1, column: 2, value: 'F' },
        ];
        board.setLetterForEachLetters(letters);
        expect(board.boardMatrix[1][1].letter).toEqual('A');
        expect(board.boardMatrix[1][2].letter).toEqual('F');
    });
});
