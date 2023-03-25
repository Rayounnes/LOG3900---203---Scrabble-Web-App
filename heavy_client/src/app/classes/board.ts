import { Letter } from '@app/interfaces/letter';
import { Tile } from './tile';
import { Vec2 } from '@app/interfaces/vec2';
import { WordArgs } from '@app/interfaces/word-args';
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
    
    verifyHorizontal(letters: Letter[]) {
        let firstLetterLine = letters[0].line;
        for (var letter of letters) {
          if (firstLetterLine != letter.line) {
            return false;
          }
        }
        return true;
      }
    
      verifyVertical(letters: Letter[]) {
        let firstLetterColumn = letters[0].column;
        for (var letter of letters) {
          if (firstLetterColumn != letter.column) {
            return false;
          }
        }
        return true;
      }
    
      findFirstVerticalLetter(letters: Letter[]) {
        let minColumnLetter: Letter = letters[0];
        for (var letter of letters) {
          if (letter.line < minColumnLetter.line) {
            minColumnLetter = letter;
          }
        }
        return minColumnLetter;
      }
    
      findFirstHorizontalLetter(letters:Letter[]) {
        let minLineLetter = letters[0];
        for (var letter of letters) {
          if (letter.column < minLineLetter.column) {
            minLineLetter = letter;
          }
        }
        return minLineLetter;
      }
    
      createWord(letters: Letter[], orientation: string): WordArgs {
        let value = '';
        for (var letter of letters) {
          value += letter.value;
        }
        return {line:letters[0].line, column: letters[0].column, orientation: orientation, value: value};
      }
    
      verifyStraightHorizontal(letters: Letter[]) {
        let startLetter = this.findFirstHorizontalLetter(letters);
        letters.sort((a, b) => a.column - b.column);
        let currentPos = startLetter.column;
        for (var letter of letters) {
          if (letter.column != currentPos) {
            return;
          }
          currentPos++;
          while (this.getIsFilled(startLetter.line, currentPos)) {
            currentPos++;
          }
        }
        return this.createWord(letters, 'h');
      }
    
      verifyStraightVertical(letters: Letter[]) {
        let startLetter: Letter = this.findFirstVerticalLetter(letters);
        letters.sort((a, b) => a.line - b.line);
        let currentPos = startLetter.line;
        for (var letter of letters) {
          if (letter.line != currentPos) {
            return;
          }
          currentPos++;
          while (this.getIsFilled(startLetter.column, currentPos)) {
            currentPos++;
          }
        }
    
        return this.createWord(letters, 'v');
      }
    
      verifyPlacement(letters:Letter[]) {
        if (letters.length === 0){
          return;
        }
        if (this.verifyHorizontal(letters)) {
          return this.verifyStraightHorizontal(letters);
        }
    
        if (this.verifyVertical(letters)) {
          return this.verifyStraightVertical(letters);
        }
        return;
      }
}
