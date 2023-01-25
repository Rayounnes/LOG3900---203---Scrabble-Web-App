import { Injectable } from '@angular/core';
import { Letter } from '@app/interfaces/letter';
import { GridService } from './grid.service';
import { ChevaletService } from './chevalet.service';
import { WordArgs } from '@app/interfaces/word-args';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseManagementService } from './mouse-management.service';
import * as gridConstants from 'src/constants/grid-constants';
import { RackTile } from '@app/classes/rack-tile';
import { ChatSocketClientService } from './chat-socket-client.service';

const END_POSITION_FILL = 13;
const END_INDEX_BOARD = 14;
const DELAY = 5;

@Injectable({
    providedIn: 'root',
})
export class KeyboardManagementService {
    letters: Letter[] = [];
    word: WordArgs = { line: 0, column: 0, orientation: '', value: '' };
    wordFormed: WordArgs;
    grid = new gridConstants.GridConstants();
    enterPressed: boolean = false;
    playPressed: boolean = false;
    temporaryRack: RackTile[] = [];
    readonly lastPositionFill = END_POSITION_FILL;

    constructor(
        public gridService: GridService,
        public chevaletService: ChevaletService,
        public mouseService: MouseManagementService,
        public socketService: ChatSocketClientService,
    ) {
        this.createTemporaryRack();
    }

    createTemporaryRack() {
        this.temporaryRack = [];
        for (const tile of this.chevaletService.rackArray) {
            this.temporaryRack.push(tile);
        }
    }

    placerOneLetter(letter: string) {
        this.gridService.board.wordStarted = true;
        let positionStart = this.gridService.board.getStartTile() as Vec2;
        this.initializeWordArg(positionStart);
        if (positionStart !== undefined) {
            while (this.conditionsDirections(positionStart)) {
                positionStart = this.incrementePosition(positionStart);
            }
            if (this.conditionToPlay(letter)) {
                this.placeLetterOnGrid(positionStart, letter);
            }
        }
    }

    incrementePosition(position: Vec2) {
        if (this.directionHorizontal(position)) {
            position.y = position.y + 1;
            this.gridService.board.changeDirection(position, 'h');
            return position;
        } else if (this.directionVertical(position)) {
            position.x = position.x + 1;
            this.gridService.board.changeDirection(position, 'v');
            return position;
        }
        return position;
    }

    directionHorizontal(position: Vec2) {
        return this.gridService.board.getDirection(position) === 'h';
    }

    directionVertical(position: Vec2) {
        return this.gridService.board.getDirection(position) === 'v';
    }

    outOfGrid(positionStart: Vec2) {
        const lastPos = 15;
        return positionStart.x < lastPos && positionStart.y < lastPos;
    }

    conditionsDirections(positionStart: Vec2) {
        return this.outOfGrid(positionStart) && this.gridService.board.getIsFilled(positionStart.y + 1, positionStart.x + 1);
    }

    initializeWordArg(positionStart: Vec2) {
        this.word.line = positionStart.y;
        this.word.column = positionStart.x;
        this.word.orientation = this.correctOrientation(positionStart);
    }

    correctOrientation(positionStart: Vec2) {
        if (this.directionHorizontal(positionStart)) {
            return 'v';
        } else if (this.directionVertical(positionStart)) {
            return 'h';
        }
        return '';
    }

    conditionToPlay(letter: string) {
        return this.conditionOnRack(letter) && !this.enterPressed && !this.playPressed;
    }

    conditionOnRack(letter: string) {
        if (this.verificationUpperCase(letter)) return this.chevaletService.verifyLetterOnRack('*') && this.isLetterAlreadyUsed('*');
        return this.chevaletService.verifyLetterOnRack(letter) && this.isLetterAlreadyUsed(letter);
    }

    isLetterAlreadyUsed(letter: string) {
        for (let i = 0; i < this.temporaryRack.length; i++) {
            if (this.temporaryRack[i] !== undefined) {
                if (this.temporaryRack[i].letter === letter) {
                    delete this.temporaryRack[i];
                    return true;
                }
            }
        }
        return false;
    }

    placeDependDirection(positionStart: Vec2) {
        if (this.directionHorizontal(positionStart)) {
            positionStart.y = positionStart.y + 1;
            this.gridService.board.changeDirection(positionStart, 'h');
        } else if (this.directionVertical(positionStart)) {
            positionStart.x = positionStart.x + 1;
            this.gridService.board.changeDirection(positionStart, 'v');
        }
        return positionStart;
    }

    addInLettersArray(letter: string, positionStart: Vec2) {
        if (this.verificationUpperCase(letter)) {
            this.letters.push({ line: positionStart.y, column: positionStart.x, value: '*' });
        } else {
            this.letters.push({ line: positionStart.y, column: positionStart.x, value: letter });
        }
    }

    putLetterOnCanvas(letter: string, positionStart: Vec2, size: number) {
        this.gridService.fillColor(positionStart.x + 1, positionStart.y + 1, '#F9E076');
        this.gridService.writeLetter(letter, positionStart.x + 1, positionStart.y + 1, size);
        this.gridService.board.isTileFilled(positionStart.y + 1, positionStart.x + 1);
    }

    placeLetterOnGrid(positionStart: Vec2, letter: string) {
        const size = 25;
        this.putLetterOnCanvas(letter, positionStart, size);
        this.addInLettersArray(letter, positionStart);
        this.word.value = this.word.value + letter;
        if (this.word.orientation === 'h' && positionStart.x < this.lastPositionFill) {
            while (this.gridService.board.getIsFilled(positionStart.y + 1, positionStart.x + 2)) {
                positionStart.x += 1;
            }
            const positionGrid = { x: positionStart.x + 2, y: positionStart.y + 1 };
            this.drawArrowHorizontal(positionGrid);
        } else if (this.word.orientation === 'v' && positionStart.y < this.lastPositionFill) {
            while (this.gridService.board.getIsFilled(positionStart.y + 2, positionStart.x + 1)) {
                positionStart.y += 1;
            }
            const positionGrid = { x: positionStart.x + 1, y: positionStart.y + 2 };
            this.drawArrowVertical(positionGrid);
        }
    }

    drawArrowVertical(position: Vec2) {
        this.mouseService.fillTheTile(position, this.grid.beige);
        this.mouseService.drawDownArrow(position);
    }

    drawArrowHorizontal(position: Vec2) {
        this.mouseService.fillTheTile(position, this.grid.beige);
        this.mouseService.drawRightArrow(position);
    }

    buttonPlayPressed() {
        this.playPressed = true;
        this.playOrEnter();
        this.playPressed = false;
    }

    removeArrowDependDirection(positionH: Vec2, positionV: Vec2, orientation: string) {
        if (orientation === 'h') {
            this.removeArrowMark(positionH, false);
        } else if (orientation === 'v') {
            this.removeArrowMark(positionV, true);
        }
    }
    removeArrowMark(positionArrow: Vec2, isVertical: boolean) {
        if (isVertical) {
            for (let i = 0; i + positionArrow.y <= END_INDEX_BOARD; i++)
                if (this.gridService.board.boardMatrix[positionArrow.y + i][positionArrow.x].letter === '') {
                    positionArrow.y = positionArrow.y + i;
                    this.removeArrow(positionArrow);
                    this.gridService.board.isNotFilled(positionArrow.y + 1, positionArrow.x + 1);
                    break;
                }
        } else {
            for (let i = 0; i + positionArrow.x <= END_INDEX_BOARD; i++)
                if (this.gridService.board.boardMatrix[positionArrow.y][positionArrow.x + i].letter === '') {
                    positionArrow.x = positionArrow.x + i;
                    this.removeArrow(positionArrow);
                    this.gridService.board.isNotFilled(positionArrow.y + 1, positionArrow.x + 1);
                    break;
                }
        }
    }

    removeArrow(positionArrow: Vec2) {
        this.putOldTile(positionArrow.x, positionArrow.y);
    }
    removeArrowAfterPlacement(position: Vec2, orientation: string) {
        if (orientation === 'h') {
            while (this.gridService.board.getIsFilled(position.x + 1, position.y + 2) && position.y < this.lastPositionFill) {
                position.y += 1;
            }
            this.removeArrow({ x: position.y + 1, y: position.x });
        } else if (orientation === 'v') {
            while (this.gridService.board.getIsFilled(position.x + 2, position.y + 1) && position.x < this.lastPositionFill) {
                position.x += 1;
            }
            this.removeArrow({ x: position.y, y: position.x + 1 });
        }
    }

    importantKey(key: string) {
        if (key === 'Backspace') {
            this.removeLastLetter();
        }
        if (key === 'Escape') {
            this.removeAllLetters();
        }
        if (key === 'Enter') {
            this.enterPressed = true;
            this.playOrEnter();
            this.enterPressed = false;
        }
    }

    async playOrEnter() {
        if (this.letters.length !== 0) {
            this.actionsAfterPlacement();
            this.socketService.send('verify-place-message', this.wordFormed);
            await new Promise((r) => setTimeout(r, DELAY));
            this.initializeBeforeTurn();
            this.chevaletService.makerackTilesIn();
        }
    }

    actionsAfterPlacement() {
        this.wordFormed = this.word;
        this.removeArrowAfterPlacement({ x: this.wordFormed.line, y: this.wordFormed.column }, this.wordFormed.orientation);
    }

    initializeBeforeTurn() {
        this.createTemporaryRack();
        this.word = { line: 0, column: 0, orientation: '', value: '' };
        this.letters = [];
    }

    removeAllLetters() {
        while (this.letters.length !== 0) {
            this.removeLastLetter();
        }
    }

    letterRemovedInRack(letter: Letter) {
        for (let i = 0; i < this.chevaletService.rackArray.length; i++) {
            if (this.chevaletService.rackArray[i].letter === letter.value) this.temporaryRack[i] = { letter: letter.value, selection: '' };
            else if (this.chevaletService.rackArray[i].letter === '*' && this.verificationUpperCase(letter.value))
                this.temporaryRack[i] = { letter: '*', selection: '' };
        }
    }

    putOldTile(positionX: number, positionY: number) {
        this.gridService.fillColor(positionX + 1, positionY + 1, this.gridService.board.getColor(positionY + 1, positionX + 1));
        this.gridService.drawDependColor(positionX + 1, positionY + 1, this.gridService.board.getColor(positionY + 1, positionX + 1));
    }

    letterRemoved(letter: Letter) {
        this.letterRemovedInRack(letter);
        this.putOldTile(letter.column, letter.line);
        if (this.gridService.board.boardMatrix[letter.line][letter.column].letter === '')
            this.gridService.board.isNotFilled(letter.line + 1, letter.column + 1);
    }

    manageArrow(positionX: number, positionY: number) {
        this.removeArrowDependDirection({ x: positionX + 1, y: positionY }, { x: positionX, y: positionY + 1 }, this.word.orientation);
        if (this.word.orientation === 'h') {
            this.drawArrowHorizontal({ x: positionX + 1, y: positionY + 1 });
        } else if (this.word.orientation === 'v') {
            this.drawArrowVertical({ x: positionX + 1, y: positionY + 1 });
        }
    }

    removeLastLetter() {
        const positionStart = this.gridService.board.getStartTile() as Vec2;
        const letterToRemove = this.letters[this.letters.length - 1];
        this.letterRemoved(letterToRemove);
        this.manageArrow(letterToRemove.column, letterToRemove.line);
        this.updateWord();
        this.gridService.drawGrid();
        this.setWordStartedFalse(letterToRemove, positionStart);
        this.chevaletService.putBackLetter(letterToRemove.value);
    }

    updateWord() {
        this.letters.pop();
        this.word.value = this.word.value.substring(0, this.word.value.length - 1);
    }

    setWordStartedFalse(letter: Letter, position: Vec2) {
        if (letter.column === position.x && letter.line === position.y) {
            this.gridService.board.wordStarted = false;
        }
    }

    verificationLowerCase(letter: string) {
        const charMin = 96;
        const charMax = 123;
        return letter.charCodeAt(0) > charMin && letter.charCodeAt(0) < charMax;
    }

    verificationUpperCase(letter: string) {
        const charMin = 64;
        const charMax = 91;
        return letter.charCodeAt(0) > charMin && letter.charCodeAt(0) < charMax && letter.length === 1;
    }

    verificationAccentOnE(letter: string) {
        if (letter === 'é' || letter === 'è') {
            return 'e';
        }
        return letter;
    }
    verificationKeyboard(letter: string) {
        return this.verificationLowerCase(letter) || this.verificationUpperCase(letter);
    }
}
