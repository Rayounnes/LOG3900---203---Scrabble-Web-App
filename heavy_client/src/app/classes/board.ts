import { Letter } from '@app/interfaces/letter';
import { Tile } from './tile';
import { Vec2 } from '@app/interfaces/vec2';

const BOARD_SIZE = 15;
export class Board {
    wordStarted = false;
    readonly endBoard = BOARD_SIZE;
    boardMatrix: Tile[][] = [];
    constructor() {
        this.intializeBoard();
    }

    intializeBoard() {
        for (let i = 0; i < this.endBoard; i++) {
            this.boardMatrix[i] = [];
            for (let j = 0; j < this.endBoard; j++) {
                this.boardMatrix[i][j] = new Tile('', false, '');
            }
        }
    }

    setColor(line: number, column: number, color: string) {
        this.boardMatrix[line - 1][column - 1].color = color;
    }

    isTileFilled(line: number, column: number) {
        this.boardMatrix[line - 1][column - 1].isFilled = true;
    }

    isNotFilled(line: number, column: number) {
        this.boardMatrix[line - 1][column - 1].isFilled = false;
    }

    getIsFilled(line: number, column: number) {
        return this.boardMatrix[line - 1][column - 1].isFilled;
    }

    setLetter(line: number, column: number, letter: string) {
        this.boardMatrix[line - 1][column - 1].letter = letter;
    }

    getColor(line: number, column: number) {
        return this.boardMatrix[line - 1][column - 1].color;
    }

    isFilledForEachLetter(letters: Letter[]) {
        for (const letter of letters) {
            this.isTileFilled(letter.line + 1, letter.column + 1);
        }
    }

    setLetterForEachLetters(letters: Letter[]) {
        for (const letter of letters) {
            this.setLetter(letter.line + 1, letter.column + 1, letter.value);
        }
    }
    setStartTile(line: number, column: number) {
        this.boardMatrix[line - 1][column - 1].isStart = true;
    }
    getStartTile(): Vec2 | undefined {
        for (let i = 0; i < this.endBoard; i++) {
            for (let j = 0; j < this.endBoard; j++) {
                if (this.boardMatrix[i][j].isStart) {
                    return { x: j, y: i };
                }
            }
        }
        return;
    }

    getDirection({ x, y }: Vec2) {
        return this.boardMatrix[x][y].direction;
    }

    changeDirection({ x, y }: Vec2, direction: string) {
        this.boardMatrix[x][y].direction = direction;
    }
    resetStartTile() {
        for (let i = 0; i < this.endBoard; i++) {
            for (let j = 0; j < this.endBoard; j++) {
                this.boardMatrix[i][j].isStart = false;
            }
        }
    }
}
