import { Board } from '@app/classes/board';
import { Letter } from '@app/interfaces/lettre';
import { Tile } from '@app/classes/tile';
import { Word } from '@app/interfaces/word';
import { BONUS_POINT, END_INDEX_BOARD, HORIZONTAL, LETTERS_POINTS, MAX_LETTERS, START_INDEX_BOARD, VERTICAL } from '@app/constants/constants';
import * as fs from 'fs';
import { Service } from 'typedi';
import { ScrabbleLog2990 } from './scrabble-log2990.service';

@Service()
export class ValidationCountingWordsService {
    dictionary: Set<string>;
    constructor(private gameBoard: Board, fileName: string) {
        this.dictionary = new Set(JSON.parse(fs.readFileSync('../server/assets/' + fileName, { encoding: 'utf8', flag: 'r' })).words);
    }
    getPlacedWord(linePosition: number, columnPosition: number, wordDirection: string, letters: Letter[]): Word {
        let word: Word = { word: '', lineStart: linePosition, columnStart: columnPosition, direction: wordDirection };

        // lettre collé avant la premiere lettre deposée
        const wordBefore: Word = this.findBeforeWord(linePosition, columnPosition, wordDirection);
        if (wordBefore.word) word = wordBefore;

        let endLetterPlaced: number = letters[letters.length - 1].line;
        if (wordDirection === HORIZONTAL) endLetterPlaced = letters[letters.length - 1].column;

        let i = linePosition;
        if (wordDirection === HORIZONTAL) i = columnPosition;

        let letterPlaced = '';
        let letterPosition = 0;
        for (i; i < endLetterPlaced + 1; i++) {
            letterPlaced = this.gameBoard.getBoxIndex(i, columnPosition).letter.value;
            if (wordDirection === HORIZONTAL) letterPlaced = this.gameBoard.getBoxIndex(linePosition, i).letter.value;
            if (!letterPlaced) {
                word.word += letters[letterPosition].value;
                letterPosition++;
            } else word.word += letterPlaced;
            // rajouter le cas ou le joueur va laisser un vide entre deux lettres placés (sprint 2)
        }

        // lettre collé aprés la derniere lettre deposée
        const wordAfter: string = this.findAfterWord(letters[letters.length - 1].line, letters[letters.length - 1].column, wordDirection);
        word.word += wordAfter;
        return word;
    }
    // mots crées par le placement de chaque lettre
    getCreatedWords(wordDirection: string, placedLetters: Letter[]): Word[] {
        const words: Word[] = [];
        for (const letter of placedLetters) {
            let word: Word;
            word = this.findBeforeWord(letter.line, letter.column, wordDirection);
            if (!word.word) word = { word: letter.value, lineStart: letter.line, columnStart: letter.column, direction: wordDirection };
            else word.word += letter.value;
            word.word += this.findAfterWord(letter.line, letter.column, wordDirection);
            if (word.word !== letter.value) words.push(word);
        }
        return words;
    }
    getAllWords(lineNumber: number, columnNumber: number, letters: Letter[], wordDirection: string = HORIZONTAL): Word[] {
        let allWords: Word[] = [];
        const ONE_LETTER = 1;
        // seulement une lettre placé
        if (letters.length === ONE_LETTER) {
            const wordCreatedOne: Word = this.getPlacedWord(lineNumber, columnNumber, HORIZONTAL, letters);
            if (wordCreatedOne.word !== letters[0].value) allWords.push(wordCreatedOne);
            const wordCreatedTwo: Word = this.getPlacedWord(lineNumber, columnNumber, VERTICAL, letters);
            if (wordCreatedTwo.word !== letters[0].value) allWords.push(wordCreatedTwo);
            return allWords;
        }
        const wordPlaced: Word = this.getPlacedWord(lineNumber, columnNumber, wordDirection, letters);
        allWords.push(wordPlaced);
        // trouve les nouveaux mots dans la direction opposé du placement
        const newWordsDirection: string = wordDirection === HORIZONTAL ? VERTICAL : HORIZONTAL;
        const wordsCreated: Word[] = this.getCreatedWords(newWordsDirection, letters);
        if (wordsCreated.length) allWords = allWords.concat(wordsCreated);
        return allWords;
    }
    verifyAllWords(letters: Letter[], wordDirection: string = HORIZONTAL): boolean {
        const lineNumber = letters[0].line;
        const columnNumber = letters[0].column;
        if (letters.length > 1) {
            const lineTwoNumber = letters[1].line;
            if (lineNumber !== lineTwoNumber) wordDirection = VERTICAL;
            const word: Word = this.getPlacedWord(lineNumber, columnNumber, wordDirection, letters);
            if (!this.verifyWords([word])) return false;
        }
        const allWords: Word[] = this.getAllWords(lineNumber, columnNumber, letters, wordDirection);
        // mots crées invalides
        const result = this.verifyWords(allWords);
        return result;
    }
    verifyAndCalculate(letters: Letter[]): number {
        const lineNumber = letters[0].line;
        const columnNumber = letters[0].column;
        let wordDirection = HORIZONTAL;
        wordDirection = letters.length !== 1 && lineNumber !== letters[1].line ? VERTICAL : HORIZONTAL;
        const allWords: Word[] = this.getAllWords(lineNumber, columnNumber, letters, wordDirection);
        const ZERO_POINTS = 0;
        // mots crées invalides
        if (!this.verifyWords(allWords)) return ZERO_POINTS;
        // mots valides ,on calcule les points et place les lettres
        const gainedPoints = this.calculateWordsPoints(allWords, letters.length);
        return gainedPoints;
    }
    verifyAndCalculateWords(letters: Letter[]): number {
        const gainedPoints = this.verifyAndCalculate(letters);
        if (gainedPoints) this.gameBoard.placeLetters(letters);
        return gainedPoints;
    }
    addGoalsPoints(letters: Letter[], log: ScrabbleLog2990, logPlayer: ScrabbleLog2990): number {
        logPlayer.goalsOfTheGame[0] = logPlayer.goals[log.goalsOfTheGame[0].id - 1];
        logPlayer.goalsOfTheGame[1] = logPlayer.goals[log.goalsOfTheGame[1].id - 1];
        let points = 0;
        const lineNumber = letters[0].line;
        const columnNumber = letters[0].column;
        let wordDirection = HORIZONTAL;
        wordDirection = letters.length !== 1 && lineNumber !== letters[1].line ? VERTICAL : HORIZONTAL;
        const allWords: Word[] = this.getAllWords(lineNumber, columnNumber, letters, wordDirection);
        const gainedPoints = this.verifyAndCalculate(letters);
        logPlayer.verificationIsCompleted(allWords, gainedPoints, letters);
        if (!log.goalsOfTheGame[0].isVerified && logPlayer.goalsOfTheGame[0].isCompleted) {
            log.goalsOfTheGame[0].isVerified = true;
            log.goalsOfTheGame[0].isCompleted = true;
            points += log.goalsOfTheGame[0].points;
        }
        if (!log.goalsOfTheGame[1].isVerified && logPlayer.goalsOfTheGame[1].isCompleted) {
            log.goalsOfTheGame[1].isVerified = true;
            log.goalsOfTheGame[1].isCompleted = true;
            points += log.goalsOfTheGame[1].points;
        }

        if (!logPlayer.privateGoal.isVerified && logPlayer.privateGoal.isCompleted) {
            logPlayer.privateGoal.isVerified = true;
            logPlayer.privateGoal.isCompleted = true;
            points += logPlayer.privateGoal.points;
        }

        return points;
    }

    calculateWordsPoints(words: Word[], numbLetters: number): number {
        let points = 0;
        if (numbLetters === MAX_LETTERS) {
            points += BONUS_POINT;
        }
        for (const word of words) {
            let wordPoint = 0;
            let wordMultipliers = 1;
            const line: number = word.lineStart;
            const column: number = word.columnStart;
            let indexIncrement: number = word.direction === HORIZONTAL ? column : line;
            const maxIndex: number = word.word.length + indexIncrement;
            let indexWord = 0;
            for (indexIncrement; indexIncrement < maxIndex; indexIncrement++) {
                let tile: Tile = this.gameBoard.getBoxIndex(line, indexIncrement);
                if (word.direction === VERTICAL) tile = this.gameBoard.getBoxIndex(indexIncrement, column);
                const letter = word.word[indexWord];
                // si une lettre n'etait pas deja presente avant le placement ,on comptabilise les multiplicateurs
                const letterPoint = letter === letter.toUpperCase() ? 0 : Number(LETTERS_POINTS.get(letter));
                if (!tile.multiplicatorUsed) {
                    if (tile.wordMultiplicator !== 1) wordMultipliers *= tile.wordMultiplicator;
                    wordPoint += letterPoint * tile.letterMultiplicator;
                    // sinon on comptabilise seulement la valeur de la lettre
                } else wordPoint += letterPoint;
                indexWord++;
            }
            // multiplie le score du mot par les multiplicateurs de mots trouvés dans le placement
            wordPoint *= wordMultipliers;
            points += wordPoint;
        }
        return points;
    }
    isPositionInStartEdges(line: number, column: number, wordDirection: string) {
        return (line === START_INDEX_BOARD && wordDirection === VERTICAL) || (column === START_INDEX_BOARD && wordDirection === HORIZONTAL);
    }
    isPositionInEndEdges(line: number, column: number, wordDirection: string) {
        return (line === END_INDEX_BOARD && wordDirection === VERTICAL) || (column === END_INDEX_BOARD && wordDirection === HORIZONTAL);
    }
    findBeforeWord(line: number, column: number, wordDirection: string): Word {
        if (this.isPositionInStartEdges(line, column, wordDirection))
            return { word: '', lineStart: line, columnStart: column, direction: wordDirection };
        if (wordDirection === VERTICAL) line--;
        else column--;
        let tileBefore: Tile = this.gameBoard.getBoxIndex(line, column);
        let beforeWord = '';
        while (tileBefore.letter.value) {
            beforeWord += tileBefore.letter.value;
            if (this.isPositionInStartEdges(line, column, wordDirection)) break;
            if (wordDirection === VERTICAL) tileBefore = this.gameBoard.getBoxIndex(--line, column);
            else tileBefore = this.gameBoard.getBoxIndex(line, --column);
        }
        if (wordDirection === VERTICAL && line !== START_INDEX_BOARD) line++;
        else if (wordDirection === HORIZONTAL && column !== START_INDEX_BOARD) column++;
        return { word: beforeWord.split('').reverse().join(''), lineStart: line, columnStart: column, direction: wordDirection };
    }

    findAfterWord(line: number, column: number, wordDirection: string): string {
        if (this.isPositionInEndEdges(line, column, wordDirection)) return '';
        if (wordDirection === VERTICAL) line++;
        else column++;
        let tileAfter: Tile = this.gameBoard.getBoxIndex(line, column);
        // recuperer le mot ecrit
        let word = '';
        while (tileAfter.letter.value) {
            word += tileAfter.letter.value;
            if (this.isPositionInEndEdges(line, column, wordDirection)) break;
            if (wordDirection === HORIZONTAL) tileAfter = this.gameBoard.getBoxIndex(line, ++column);
            else tileAfter = this.gameBoard.getBoxIndex(++line, column);
        }
        return word;
    }
    verifyWords(words: Word[]) {
        for (const word of words) {
            if (!this.dictionary.has(word.word.toLowerCase())) return false;
        }
        return true;
    }
}
