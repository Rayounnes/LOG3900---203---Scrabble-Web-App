import { Injectable } from '@angular/core';
const INVALID_CHARACTERS = ['-', "'", '`'];
@Injectable({
    providedIn: 'root',
})
export class ArgumentManagementService {
    private lineMess: number;
    private columnMess: number;
    private orientationMess: string;
    private word: string;
    private dividedMessage: string[];
    verifyInvalidCharacters(letters: string): boolean {
        for (const character of INVALID_CHARACTERS) {
            if (letters.includes(character)) return true;
        }
        return false;
    }
    splitMessage(message: string): boolean {
        const aAscii = 97;
        this.dividedMessage = message.split(' ');
        if (this.dividedMessage.length !== 3) return false;
        this.lineMess = this.dividedMessage[1][0].charCodeAt(0) - aAscii;
        this.columnMess = Number(this.dividedMessage[1].substring(1, this.dividedMessage[1].length - 1)) - 1;
        // enlever les accents
        this.word = this.dividedMessage[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        this.orientationMess = this.dividedMessage[1][this.dividedMessage[1].length - 1];
        return true;
    }
    createWordObject() {
        if (this.validation()) {
            return { line: this.lineMess, column: this.columnMess, orientation: this.orientationMess, value: this.word };
        }
        return false;
    }
    formatInput(message: string) {
        if (this.splitMessage(message)) return this.createWordObject();
        return false;
    }
    verificationOrientation(orientation: string, word: string): boolean {
        if (orientation === 'h' || orientation === 'v') return true;
        else if (word.length === 1 && !isNaN(Number(orientation))) {
            this.columnMess = Number(this.dividedMessage[1].substring(1, this.dividedMessage[1].length)) - 1;
            this.orientationMess = 'h';
            return true;
        } else return false;
    }

    verificationColumn(column: number): boolean {
        const columnNumber = 15;
        return column >= 0 && column <= columnNumber;
    }

    verificationLine(line: number): boolean {
        const lineNumber = 15;
        return line >= 0 && line <= lineNumber;
    }

    verificationWord(): boolean {
        return !(this.word === undefined || this.verifyInvalidCharacters(this.word));
    }

    validation(): boolean {
        return (
            this.verificationOrientation(this.orientationMess, this.word) &&
            this.verificationColumn(this.columnMess) &&
            this.verificationLine(this.lineMess) &&
            this.verificationWord()
        );
    }
}
