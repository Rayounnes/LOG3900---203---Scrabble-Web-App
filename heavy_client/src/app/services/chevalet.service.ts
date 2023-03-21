import { Injectable } from '@angular/core';
import { RackTile } from '@app/classes/rack-tile';
import * as chevaletConstants from 'src/constants/chevalet-constants';
import * as gridConstants from 'src/constants/grid-constants';
import { LETTERS_POINTS } from 'src/constants/points-constants';
const RACK_SIZE = 7;
const END_POSITION = 6;
@Injectable({
    providedIn: 'root',
})
export class ChevaletService {
    chevaletContext: CanvasRenderingContext2D;
    chevalet = new chevaletConstants.ChevaletConstants();
    grid = new gridConstants.GridConstants();
    rackArray: RackTile[] = [];
    readonly endRack = RACK_SIZE;
    display: boolean = false;
    isManipulate: boolean = false;
    readonly lastPosition = END_POSITION;

    constructor() {
        for (let i = 0; i < this.endRack; i++) {
            this.rackArray[i] = new RackTile();
        }
    }
    getPosition(letter: string) {
        for (let i = 0; i < this.endRack; i++) {
            if (letter.toUpperCase() === letter) {
                if (this.rackArray[i].letter === '*' && !this.rackArray[i].isOut) {
                    return i;
                }
            }
            if (this.rackArray[i].letter === letter && !this.rackArray[i].isOut) {
                return i;
            }
        }
        return undefined;
    }

    drawChevalet() {
        this.chevaletContext.beginPath();
        this.chevaletContext.strokeStyle = this.chevalet.beige;
        this.chevaletContext.lineWidth = this.chevalet.rackLineWidth;

        for (let i = this.chevalet.pos1; i < this.chevalet.squareNumber; i++) {
            this.chevaletContext.moveTo((this.width * i) / this.chevalet.squareNumber, 0);
            this.chevaletContext.lineTo(
                (this.width * i) / this.chevalet.squareNumber,
                (this.height * this.chevalet.squareNumber) / this.chevalet.squareNumber,
            );
        }
        //this.chevaletContext.stroke();
    }
    fillChevalet() {
        this.chevaletContext.fillStyle = this.chevalet.colorRack;
        for (let i = this.chevalet.startLine; i < this.chevalet.squareNumber; i++) {
            /* this.chevaletContext.fillRect(((i * this.width) / this.chevalet.squareNumber)+(1.5*i), 0, this.width / this.chevalet.squareNumber, this.height) */;
            const cornerRadius = 0; // Adjust this value to change the corner radius
            this.drawRoundedRect(((i * this.width) / this.chevalet.squareNumber)+(1.5*i), 0, this.width / this.chevalet.squareNumber, this.height, cornerRadius);
        }
    }


    private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
        console.log(x)
        console.log(y)
        this.chevaletContext.beginPath();
        this.chevaletContext.moveTo(x + radius, y);
        this.chevaletContext.lineTo(x + width - radius, y);
        this.chevaletContext.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.chevaletContext.lineTo(x + width, y + height - radius);
        this.chevaletContext.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.chevaletContext.lineTo(x + radius, y + height);
        this.chevaletContext.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.chevaletContext.lineTo(x, y + radius);
        this.chevaletContext.quadraticCurveTo(x, y, x + radius, y);
        this.chevaletContext.closePath();
        this.chevaletContext.fill();
      }

    writeOneLetterOnRack(letter: string, posx: number) {
        this.chevaletContext.fillStyle = this.grid.black;
        this.chevaletContext.font = this.chevalet.rackFont;
        this.chevaletContext.fillText(
            letter.toUpperCase(),
            (((posx + this.chevalet.shiftPosX) * this.width) / this.chevalet.squareNumber)+(1.5*posx),
            this.height / this.chevalet.factorPosY,
        );
    }
    writePoint(letter: string, posx: number) {
        if (!letter) return;
        let point = String(LETTERS_POINTS.get(letter));
        this.chevaletContext.font = '15px system-ui';
        if (letter === '*') point = '0';
        this.chevaletContext.fillText(
            point,
            ((posx + this.chevalet.shiftPointX) * this.width) / this.chevalet.squareNumber,
            this.height - this.chevalet.shiftPointY,
        );
    }

    writeLettersOnRack(chevaletArray: string[]) {
        for (let i = this.chevalet.startLine; i < this.chevalet.squareNumber; i++) {
            if (chevaletArray[i] !== undefined) {
                if (chevaletArray[i]) {
                    this.writeOneLetterOnRack(chevaletArray[i], i);
                    this.writePoint(chevaletArray[i], i);
                }
            }
        }
    }
    makerackTilesIn() {
        for (const tiles of this.rackArray) {
            tiles.isOut = false;
        }
    }

    updateRack(chevaletArray: string[]) {
        this.fillChevalet();
        this.writeLettersOnRack(chevaletArray);
        this.drawChevalet();
    }

    removeLetterOnRack(letter: string) {
        const position = this.getPosition(letter) as number;
        this.fillTheTile(position, this.chevalet.colorRack);
        this.makeLetterOut(letter);
    }
    makeLetterOut(letter: string) {
        for (const tile of this.rackArray) {
            if (tile.letter === letter && !tile.isOut) {
                tile.isOut = true;
                break;
            }
            if (letter === letter.toUpperCase() && !tile.isOut && tile.letter === '*') {
                tile.isOut = true;
                break;
            }
        }
    }

    putBackLetter(letter: string) {
        for (let i = 0; i < this.rackArray.length; i++) {
            if (letter === letter.toUpperCase() && this.verifyLetterOut('*', i)) {
                this.reDrawLetter(i);
                break;
            }
            if (this.verifyLetterOut(letter, i)) {
                this.reDrawLetter(i);
                break;
            }
        }
    }
    reDrawLetter(position: number) {
        this.rackArray[position].isOut = false;
        this.writeOneLetterOnRack(this.rackArray[position].letter, position);
        this.writePoint(this.rackArray[position].letter, position);
    }

    verifyLetterOut(letter: string, position: number) {
        return this.rackArray[position].letter === letter && this.rackArray[position].isOut;
    }

    verifyLetterOnRack(letter: string) {
        for (let i = 0; i < this.endRack; i++) {
            if (this.rackArray[i].letter === letter) return true;
        }
        return false;
    }

    findPosition(position: number) {
        return Math.trunc((this.chevalet.squareNumber / this.chevalet.width) * position);
    }

    fillTheTile(position: number, color: string) {
        this.chevaletContext.fillStyle = color;
        const cornerRadius = 14; // Adjust this value to change the corner radius
        this.drawRoundedRect((position * this.width) / this.chevalet.squareNumber, 0, this.width / this.chevalet.squareNumber, this.height, cornerRadius);
        //this.chevaletContext.fillRect((position * this.width) / this.chevalet.squareNumber, 0, this.width / this.chevalet.squareNumber, this.height);
    }

    deselectAllLetters() {
        for (let i = this.chevalet.startLine; i < this.chevalet.squareNumber; i++) {
            if (this.rackArray[i].selection !== '') {
                this.fillTheTile(i, this.chevalet.colorRack);
                this.deselectLetter(i);
            }
        }
        this.drawChevalet();
        this.isLetterSelected('echanger');
    }
    deselectLetter(position: number) {
        this.fillTheTile(position, this.chevalet.colorRack);
        this.writeOneLetterOnRack(this.rackArray[position].letter, position);
        this.writePoint(this.rackArray[position].letter, position);
        this.rackArray[position].selection = '';
    }
    selectLetter(position: number, selection: string) {
        if (selection === 'echanger') this.fillTheTile(position, 'beige');
        if (selection === 'manipuler') this.fillTheTile(position, 'yellow');
        this.writeOneLetterOnRack(this.rackArray[position].letter, position);
        this.writePoint(this.rackArray[position].letter, position);
        this.rackArray[position].selection = selection;
    }

    changeRackTile(event: MouseEvent) {
        const position = this.findPosition(event.offsetX);
        if (event.button === 2) {
            this.deselectManipulateLetter();
            if (this.rackArray[position].selection !== 'echanger') {
                this.selectLetter(position, 'echanger');
            } else {
                this.deselectLetter(position);
            }
            this.isLetterSelected('echanger');
        } else if (event.button === 0) {
            this.deselectAllLetters();
            this.selectLetter(position, 'manipuler');
            this.isLetterSelected('manipuler');
        }
    }
    letterSelectedInRack(selection: string, inRack: boolean) {
        if (selection === 'echanger') this.display = inRack;
        if (selection === 'manipuler') this.isManipulate = inRack;
    }

    isLetterSelected(selection: string) {
        for (const tile of this.rackArray) {
            if (tile.selection === selection) {
                this.letterSelectedInRack(selection, true);
                return;
            }
        }
        this.letterSelectedInRack(selection, false);
        return;
    }

    validationReserve(reserveLength: number) {
        if (reserveLength < this.chevalet.squareNumber) {
            return true;
        }
        return false;
    }
    lettersToExchange() {
        let lettersToExchange = '';
        for (const tile of this.rackArray) {
            if (tile.selection === 'echanger') {
                lettersToExchange += tile.letter;
            }
        }
        return lettersToExchange;
    }
    setLettersOfRack(chevalet: string[]) {
        for (let i = 0; i < this.chevalet.squareNumber; i++) {
            this.rackArray[i].letter = chevalet[i];
        }
    }

    get width(): number {
        return this.chevalet.width;
    }
    get height(): number {
        return this.chevalet.height;
    }
    findManipulateLetter() {
        for (let i = 0; i < this.rackArray.length; i++) {
            if (this.rackArray[i].selection === 'manipuler') {
                return i;
            }
        }
        return;
    }
    deselectManipulateLetter() {
        if (this.findManipulateLetter()) {
            this.deselectLetter(this.findManipulateLetter() as number);
        }
    }

    moveLetter(buttonPressed: string) {
        const position = this.findManipulateLetter();
        if (position !== undefined) {
            if (buttonPressed === 'ArrowRight') {
                this.moveLetterRight(position);
            }
            if (buttonPressed === 'ArrowLeft') {
                this.moveLetterLeft(position);
            }
        }
    }
    moveLetterRight(position: number) {
        if (position === this.lastPosition) {
            this.moveOnRack(position, 0);
        } else {
            this.moveOnRack(position, position + 1);
        }
    }
    moveLetterLeft(position: number) {
        if (position === 0) {
            this.moveOnRack(position, this.lastPosition);
        } else {
            this.moveOnRack(position, position - 1);
        }
    }
    moveOnRack(position: number, positionToReplace: number) {
        const tempFirst = this.rackArray[positionToReplace];
        this.rackArray[positionToReplace] = this.rackArray[position];
        this.rackArray[position] = tempFirst;
        this.updateRack(this.rackArrayLetters());
        this.selectLetter(positionToReplace, 'manipuler');
    }
    rackArrayLetters() {
        const rackLetters = [];
        for (const tile of this.rackArray) {
            rackLetters.push(tile.letter);
        }
        return rackLetters;
    }
    selectLetterKeyboard(buttonPressed: string) {
        const endRack = 6;
        for (let i = 0; i < this.rackArray.length; i++) {
            if (this.isLetterReadyToManipulate(i, buttonPressed)) {
                this.deselectAllLetters();
                this.selectLetter(i, 'manipuler');
                this.isLetterSelected('manipuler');
                break;
            }
            if (i === endRack && buttonPressed !== 'ArrowRight' && buttonPressed !== 'ArrowLeft') {
                this.deselectAllLetters();
            }
        }
    }
    isLetterReadyToManipulate(position: number, letter: string) {
        return this.rackArray[position].letter === letter && this.rackArray[position].selection !== 'manipuler' && !this.rackArray[position].isOut;
    }
}
