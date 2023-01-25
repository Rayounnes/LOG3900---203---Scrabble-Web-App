import { Injectable } from '@angular/core';
import { Board } from '@app/classes/board';
import { CanvasSize } from '@app/interfaces/canvas-size';
import { Letter } from '@app/interfaces/letter';
import { Vec2 } from '@app/interfaces/vec2';
import * as gridConstants from 'src/constants/grid-constants';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from 'src/constants/grid-constants';

import { LETTERS_POINTS } from 'src/constants/points-constants';
const COLUMN_EIGHT = 8;
const COLUMN_FOUR = 4;
const COLUMN_TWELVE = 12;
const COLUMN_FIFTEEN = 15;
const LINE_C = 3;
const LINE_G = 7;
const LINE_I = 9;
const LINE_M = 13;
const LINE_H = 8;
const LINE_D = 4;
const LINE_L = 12;
const LINE_B = 2;
const LINE_F = 6;
const END = 16;

enum Colors {
    Green = '#97BC62FF',
    Pink = 'rgb(255, 192,203)',
    Red = 'rgb(255, 83, 73)',
    LightBlue = 'rgb(0, 200,255)',
    DarkBlue = 'rgb(0, 140,255)',
}

@Injectable({
    providedIn: 'root',
})
export class GridService {
    board = new Board();
    gridContext: CanvasRenderingContext2D;
    grid = new gridConstants.GridConstants();
    private canvasSize: CanvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    fillAndSetColor(pos1: number, pos2: number, color: string) {
        this.fillColor(pos1, pos2, color);
        this.board.setColor(pos1, pos2, color);
    }

    fillSpecificLightBlue(line: number) {
        this.fillAndSetColor(LINE_C, line, this.grid.lightBlue);
        this.fillAndSetColor(LINE_G, line, this.grid.lightBlue);
        this.fillAndSetColor(LINE_I, line, this.grid.lightBlue);
        this.fillAndSetColor(LINE_M, line, this.grid.lightBlue);
    }
    drawWordSpecificLightBlue(line: number, wordSize: number) {
        this.gridContext.fillStyle = this.grid.black;
        this.drawLetterAndFactorTwo(3, line, wordSize);
        this.drawLetterAndFactorTwo(LINE_G, line, wordSize);
        this.drawLetterAndFactorTwo(LINE_I, line, wordSize);
        this.drawLetterAndFactorTwo(LINE_M, line, wordSize);
    }

    drawGrid() {
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = this.grid.black;
        this.gridContext.lineWidth = 1.5;

        for (let i = 1; i < this.grid.endColumn; i++) {
            this.gridContext.moveTo((this.width * 1) / END, (this.height * i) / END);
            this.gridContext.lineTo((this.width * END) / END, (this.height * i) / END);

            this.gridContext.moveTo((this.width * i) / END, (this.height * 1) / END);
            this.gridContext.lineTo((this.width * i) / END, (this.height * END) / END);
        }
        this.gridContext.stroke();
    }

    drawWordMot(pos1: number, pos2: number, wordSize: number) {
        this.drawWord(
            this.grid.word,
            (pos1 * this.width) / this.grid.numberOfTiles,
            (pos2 * this.height) / this.grid.numberOfTiles,
            wordSize + this.grid.pixels,
            this.grid.wordStep,
        );
    }

    drawWordLetter(pos1: number, pos2: number, wordSize: number) {
        this.drawWord(
            this.grid.letter,
            (pos1 * this.width) / this.grid.numberOfTiles,
            (pos2 * this.height) / this.grid.numberOfTiles,
            wordSize + this.grid.pixels,
            this.grid.letterStep,
        );
    }

    drawWordFactorThree(pos1: number, pos2: number, wordSize: number) {
        this.drawWord(
            this.grid.factorThree,
            (pos1 * this.width) / this.grid.numberOfTiles,
            (pos2 * this.height) / this.grid.numberOfTiles,
            wordSize + this.grid.pixels,
            this.grid.factorStep,
        );
    }

    fillColor(pos1: number, pos2: number, color: string) {
        this.gridContext.fillStyle = color;
        this.gridContext.fillRect((pos1 * this.width) / END, (pos2 * this.height) / END, (this.width * 1) / END, (this.height * 1) / END);
    }
    drawWordFactorTwo(pos1: number, pos2: number, wordSize: number) {
        this.drawWord(
            this.grid.factorTwo,
            (pos1 * this.width) / this.grid.numberOfTiles,
            (pos2 * this.height) / this.grid.numberOfTiles,
            wordSize + this.grid.pixels,
            this.grid.factorStep,
        );
    }

    fillGreenTiles() {
        for (let i = this.grid.startLine; i < this.grid.endLine; i += 1) {
            for (let j = this.grid.startLine; j < this.grid.endColumn; j += 1) {
                this.fillAndSetColor(i, j, this.grid.lightGreen);
            }
        }
    }

    fillRed() {
        for (let j = this.grid.startColumn; j < this.grid.endColumn; j += LINE_G) {
            for (let i = this.grid.startLine; i < this.grid.endLine; i += LINE_G) {
                this.fillAndSetColor(i, j, this.grid.red);
            }
        }
    }

    drawWordRed(wordSize: number) {
        for (let j = 1; j < END; j += LINE_G) {
            for (let i = 1; i < END; i += LINE_G) {
                this.gridContext.fillStyle = this.grid.black;
                this.drawWordMot(i + this.grid.shiftLetterLine, j + this.grid.shiftLetterColumn, wordSize);
                this.drawWordFactorThree(i + this.grid.shiftFactorLine, j + this.grid.shiftFactorColumn, wordSize);
            }
        }
    }
    fillDarkBlue() {
        for (let j = 2; j < END; j += LINE_D) {
            for (let i = 2; i < END; i += LINE_D) {
                this.fillAndSetColor(i, j, this.grid.darkBlue);
            }
        }
    }
    drawWordDarkBlue(wordSize: number) {
        for (let j = 2; j < END; j += LINE_D) {
            for (let i = 2; i < END; i += LINE_D) {
                this.gridContext.fillStyle = this.grid.black;
                this.drawWordLetter(i + this.grid.shiftLetterLine, j + this.grid.shiftLetterColumn, wordSize);
                this.drawWordFactorThree(i + this.grid.shiftFactorLine, j + this.grid.shiftFactorColumn, wordSize);
            }
        }
    }

    fillLightBlue() {
        this.fillSpecificLightBlue(LINE_C);
        this.fillSpecificLightBlue(LINE_G);
        this.fillSpecificLightBlue(LINE_I);
        this.fillSpecificLightBlue(LINE_M);
        for (let i = 1; i < END; i += LINE_G) {
            this.fillAndSetColor(LINE_D, i, this.grid.lightBlue);
            this.fillAndSetColor(LINE_L, i, this.grid.lightBlue);
            this.fillAndSetColor(i, COLUMN_FOUR, this.grid.lightBlue);
            this.fillAndSetColor(i, COLUMN_TWELVE, this.grid.lightBlue);
        }
    }

    drawLetterAndFactorTwo(posx: number, posy: number, wordSize: number) {
        this.drawWordLetter(posx + this.grid.shiftLetterLine, posy + this.grid.shiftLetterColumn, wordSize);
        this.drawWordFactorTwo(posx + this.grid.shiftFactorLine, posy + this.grid.shiftFactorColumn, wordSize);
    }

    drawWordLightBlue(wordSize: number) {
        this.drawWordSpecificLightBlue(LINE_C, wordSize);
        this.drawWordSpecificLightBlue(LINE_G, wordSize);
        this.drawWordSpecificLightBlue(LINE_I, wordSize);
        this.drawWordSpecificLightBlue(LINE_M, wordSize);
        for (let i = 1; i < END; i += LINE_G) {
            this.gridContext.fillStyle = this.grid.black;
            this.drawLetterAndFactorTwo(LINE_D, i, wordSize);
            this.drawLetterAndFactorTwo(LINE_L, i, wordSize);
            this.drawLetterAndFactorTwo(i, COLUMN_FOUR, wordSize);
            this.drawLetterAndFactorTwo(i, COLUMN_TWELVE, wordSize);
        }
    }
    fillPink() {
        for (let i = LINE_B; i < LINE_F; i++) {
            this.fillAndSetColor(i, i, this.grid.pink);
            this.fillAndSetColor(i, this.grid.endColumn - i, this.grid.pink);
            this.fillAndSetColor(this.grid.endLine - i, i, this.grid.pink);
            this.fillAndSetColor(this.grid.endLine - i, this.grid.endColumn - i, this.grid.pink);
        }
        this.fillAndSetColor(LINE_H, COLUMN_EIGHT, this.grid.pink);
    }
    drawMotAndFactorTwo(posx: number, posy: number, wordSize: number) {
        this.drawWordMot(posx + this.grid.shiftLetterLine, posy + this.grid.shiftLetterColumn, wordSize);
        this.drawWordFactorTwo(posx + this.grid.shiftFactorLine, posy + this.grid.shiftFactorColumn, wordSize);
    }
    drawWordPink(wordSize: number) {
        for (let i = 2; i < LINE_F; i++) {
            this.gridContext.fillStyle = this.grid.black;
            this.drawMotAndFactorTwo(i, i, wordSize);
            this.drawMotAndFactorTwo(i, this.grid.endColumn - i, wordSize);
            this.drawMotAndFactorTwo(this.grid.endLine - i, i, wordSize);
            this.drawMotAndFactorTwo(this.grid.endLine - i, this.grid.endColumn - i, wordSize);
        }
        this.drawMotAndFactorTwo(LINE_H, COLUMN_EIGHT, wordSize);
    }
    drawPosition() {
        const shiftColumn = 1.85;
        const posX = 0.1;
        const posY = 0.85;
        const listLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        this.gridContext.fillStyle = this.grid.beige;
        // Nous avons besoin des positions et pas des elements de la liste
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < listLetters.length; i++) {
            this.drawWord(listLetters[i], (posX * this.width) / END, ((i + shiftColumn) * this.height) / END, '40px system-ui', END);
            this.drawWord(String(i + 1), ((i + 1) * this.width) / END, (posY * this.height) / END, '40px system-ui', END);
        }
    }
    drawWord(word: string, xpos: number, ypos: number, font: string, steps: number) {
        const startPosition: Vec2 = { x: xpos, y: ypos };
        const step = steps;
        this.gridContext.font = font;
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
    }
    drawStar() {
        const letter = { x: 7.8, y: 8.18, size: 50 };
        this.fillColor(LINE_H, COLUMN_EIGHT, this.grid.pink);
        this.writeLetter('\u{2605}', letter.x, letter.y, letter.size);
    }
    fillPositions() {
        for (let i = 0; i < END; i++) {
            this.fillColor(i, 0, '#2C5F2D');
            this.fillColor(0, i, '#2C5F2D');
        }
    }
    buildBoard(wordSize: number) {
        this.board.intializeBoard();
        this.fillGreenTiles();
        this.fillRed();
        this.drawWordRed(wordSize);
        this.fillDarkBlue();
        this.drawWordDarkBlue(wordSize);
        this.fillLightBlue();
        this.drawWordLightBlue(wordSize);
        this.fillPink();
        this.drawWordPink(wordSize);
        this.drawStar();
        this.drawGrid();
    }
    writePoint(letter: string, posx: number, posy: number, size: number) {
        const stepGreaterTen = 0.6;
        let points = String(LETTERS_POINTS.get(letter));
        let stepNumber = 0.7;
        const sizePoint = size - COLUMN_FIFTEEN;
        if (letter === letter.toUpperCase()) points = '0';
        if (Number(LETTERS_POINTS.get(letter)) > LINE_I) stepNumber = stepGreaterTen;
        this.gridContext.font = sizePoint + 'px system-ui';
        this.gridContext.fillText(
            points,
            ((posx + stepNumber) * this.width) / this.grid.numberOfTiles,
            ((posy + this.grid.shiftFactorColumn) * this.height) / this.grid.numberOfTiles,
        );
    }
    writeLetter(letter: string, posx: number, posy: number, size: number) {
        const shift = { shiftPosX: 0.17, shiftPosY: 0.75 };
        const charMin = 64;
        const charMax = 123;
        this.gridContext.fillStyle = this.grid.black;
        this.gridContext.font = size + 'px system-ui';
        this.gridContext.fillText(
            letter.toUpperCase(),
            ((posx + shift.shiftPosX) * this.width) / this.grid.numberOfTiles,
            ((posy + shift.shiftPosY) * this.height) / this.grid.numberOfTiles,
        );
        if (letter.charCodeAt(0) > charMin && letter.charCodeAt(0) < charMax) this.writePoint(letter, posx, posy, size);
    }
    placeLetter(letters: Letter[]) {
        const size = 25;
        for (const letter of letters) {
            this.fillColor(letter.column + 1, letter.line + 1, '#F9E076');
            this.writeLetter(letter.value, letter.column + 1, letter.line + 1, size);
        }
        this.drawGrid();
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
    removeLetter(letters: Letter[]) {
        for (const letter of letters) {
            this.board.isNotFilled(letter.line + 1, letter.column + 1);
            this.board.setLetter(letter.line + 1, letter.column + 1, '');
            this.fillColor(letter.column + 1, letter.line + 1, this.board.getColor(letter.line + 1, letter.column + 1));
            this.drawDependColor(letter.column + 1, letter.line + 1, this.board.getColor(letter.line + 1, letter.column + 1));
        }
        this.drawGrid();
    }
    drawDependColor(posX: number, posY: number, color: string) {
        if (color === Colors.Pink) {
            if (posX === COLUMN_EIGHT && posY === COLUMN_EIGHT) {
                this.drawStar();
            } else {
                this.gridContext.fillStyle = this.grid.black;
                this.drawMotAndFactorTwo(posX, posY, LINE_M);
            }
        }
        if (color === Colors.LightBlue) {
            this.gridContext.fillStyle = this.grid.black;
            this.drawLetterAndFactorTwo(posX, posY, LINE_M);
        }

        if (color === Colors.Red) {
            this.gridContext.fillStyle = this.grid.black;
            this.drawWordMot(posX + this.grid.shiftLetterLine, posY + this.grid.shiftLetterColumn, LINE_M);
            this.drawWordFactorThree(posX + this.grid.shiftFactorLine, posY + this.grid.shiftFactorColumn, LINE_M);
        }

        if (color === Colors.DarkBlue) {
            this.gridContext.fillStyle = this.grid.black;
            this.drawWordLetter(posX + this.grid.shiftLetterLine, posY + this.grid.shiftLetterColumn, LINE_M);
            this.drawWordFactorThree(posX + this.grid.shiftFactorLine, posY + this.grid.shiftFactorColumn, LINE_M);
        }
    }
    changeSizeLetters(size: number) {
        for (let i = 0; i < COLUMN_FIFTEEN; i++) {
            for (let j = 0; j < COLUMN_FIFTEEN; j++) {
                if (this.board.boardMatrix[i][j].isFilled) {
                    this.fillColor(j + 1, i + 1, '#F9E076');
                    this.writeLetter(this.board.boardMatrix[i][j].letter, j + 1, i + 1, size);
                }
            }
        }
        this.drawGrid();
    }
}
