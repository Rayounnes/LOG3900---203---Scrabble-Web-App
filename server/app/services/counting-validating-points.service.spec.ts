import { Board } from '@app/classes/board';
import { Goal } from '@app/classes/goal';
import { Letter } from '@app/interfaces/lettre';
import { Word } from '@app/interfaces/word';
import { BONUS_POINT } from '@app/constants/constants';
import { CREATED_WORDS, WORDS_CREATION_HORIZONTAL, WORDS_CREATION_VERTICAL } from '@app/constants/validation-constants';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { expect } from 'chai';
import { ScrabbleLog2990 } from './scrabble-log2990.service';
/* eslint max-lines: ["error", 600]*/
describe('Validation-Counting', () => {
    let gameBoard: Board;
    let validationCountingService: ValidationCountingWordsService;
    let fileName: string;

    beforeEach(async () => {
        gameBoard = new Board();
        fileName = 'dictionnary.json';
        validationCountingService = new ValidationCountingWordsService(gameBoard, fileName);
    });

    it('getPlaceWord should find a vertical word ', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 7, column: 5 },
            { value: 'b', line: 7, column: 6 },
            { value: 'a', line: 7, column: 7 },
            { value: 'c', line: 7, column: 8 },
            { value: 'a', line: 7, column: 9 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 4, column: 7 },
            { value: 'a', line: 5, column: 7 },
            { value: 'y', line: 6, column: 7 },
            { value: 'n', line: 8, column: 7 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'v', myWord);
        expect(mot.word).to.eql('rayan');
    });
    it('getPlaceWord should find a vertical word when a word is between the letters', () => {
        const startLetters: Letter[] = [
            { value: 't', line: 5, column: 6 },
            { value: 'e', line: 6, column: 6 },
            { value: 's', line: 7, column: 6 },
            { value: 't', line: 8, column: 6 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 3, column: 6 },
            { value: 'e', line: 4, column: 6 },
            { value: 'e', line: 9, column: 6 },
            { value: 'r', line: 10, column: 6 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'v', myWord);
        expect(mot.word).to.eql('retester');
    });

    it('getPlaceWord should find a horizontal word ', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 5, column: 7 },
            { value: 'b', line: 6, column: 7 },
            { value: 'a', line: 7, column: 7 },
            { value: 'c', line: 8, column: 7 },
            { value: 'a', line: 9, column: 7 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 5, column: 6 },
            { value: 'y', line: 5, column: 8 },
            { value: 'a', line: 5, column: 9 },
            { value: 'n', line: 5, column: 10 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'h', myWord);
        expect(mot.word).to.eql('rayan');
    });

    it('getPlaceWord should find a horizontal word when a word is between the letters', () => {
        const startLetters: Letter[] = [
            { value: 't', line: 6, column: 5 },
            { value: 'e', line: 6, column: 6 },
            { value: 's', line: 6, column: 7 },
            { value: 't', line: 6, column: 8 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 6, column: 3 },
            { value: 'e', line: 6, column: 4 },
            { value: 'e', line: 6, column: 9 },
            { value: 'r', line: 6, column: 10 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'h', myWord);
        expect(mot.word).to.eql('retester');
    });

    it('getPlaceWord should find a vertical word attached to a word before the first letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 5, column: 7 },
            { value: 'b', line: 6, column: 7 },
            { value: 'a', line: 7, column: 7 },
            { value: 'c', line: 8, column: 7 },
            { value: 'a', line: 9, column: 7 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 10, column: 7 },
            { value: 'y', line: 11, column: 7 },
            { value: 'a', line: 12, column: 7 },
            { value: 'n', line: 13, column: 7 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'v', myWord);
        expect(mot.word).to.eql('abacaryan');
    });

    it('getPlaceWord should find a vertical word attached to a word after the last letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 9, column: 7 },
            { value: 'b', line: 10, column: 7 },
            { value: 'a', line: 11, column: 7 },
            { value: 'c', line: 12, column: 7 },
            { value: 'a', line: 13, column: 7 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 5, column: 7 },
            { value: 'y', line: 6, column: 7 },
            { value: 'a', line: 7, column: 7 },
            { value: 'n', line: 8, column: 7 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'v', myWord);
        expect(mot.word).to.eql('ryanabaca');
    });

    it('getPlaceWord should find a horizontal word attached to a word before the first letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 7, column: 1 },
            { value: 'b', line: 7, column: 2 },
            { value: 'a', line: 7, column: 3 },
            { value: 'c', line: 7, column: 4 },
            { value: 'a', line: 7, column: 5 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 7, column: 6 },
            { value: 'y', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 'n', line: 7, column: 9 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'h', myWord);
        expect(mot.word).to.eql('abacaryan');
    });

    it('getPlaceWord should find a horizontal word attached to a word after the last letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 7, column: 10 },
            { value: 'b', line: 7, column: 11 },
            { value: 'a', line: 7, column: 12 },
            { value: 'c', line: 7, column: 13 },
            { value: 'a', line: 7, column: 14 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 7, column: 6 },
            { value: 'y', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 'n', line: 7, column: 9 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'h', myWord);
        expect(mot.word).to.eql('ryanabaca');
    });
    it('getPlaceWord should find a vertical word attached to a word before the first letter and after the last letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 1, column: 7 },
            { value: 'b', line: 2, column: 7 },
            { value: 'a', line: 3, column: 7 },
            { value: 'c', line: 4, column: 7 },
            { value: 'a', line: 5, column: 7 },
            { value: 't', line: 10, column: 7 },
            { value: 'e', line: 11, column: 7 },
            { value: 's', line: 12, column: 7 },
            { value: 't', line: 13, column: 7 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 6, column: 7 },
            { value: 'y', line: 7, column: 7 },
            { value: 'a', line: 8, column: 7 },
            { value: 'n', line: 9, column: 7 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'v', myWord);
        expect(mot.word).to.eql('abacaryantest');
    });

    it('getPlaceWord should find a horizontal word attached to a word before the first letter and after the last letter', () => {
        const startLetters: Letter[] = [
            { value: 'a', line: 7, column: 0 },
            { value: 'b', line: 7, column: 1 },
            { value: 'a', line: 7, column: 2 },
            { value: 'c', line: 7, column: 3 },
            { value: 'a', line: 7, column: 4 },
            { value: 't', line: 7, column: 9 },
            { value: 'e', line: 7, column: 10 },
            { value: 's', line: 7, column: 11 },
            { value: 't', line: 7, column: 12 },
        ];
        const myWord: Letter[] = [
            { value: 'r', line: 7, column: 5 },
            { value: 'y', line: 7, column: 6 },
            { value: 'a', line: 7, column: 7 },
            { value: 'n', line: 7, column: 8 },
        ];
        gameBoard.placeLetters(startLetters);
        const mot: Word = validationCountingService.getPlacedWord(myWord[0].line, myWord[0].column, 'h', myWord);
        expect(mot.word).to.eql('abacaryantest');
    });
    it('findBeforeWord should not find a vertical word if the first letter is in line A', () => {
        const myWord: Letter[] = [
            { value: 't', line: 0, column: 5 },
            { value: 'e', line: 1, column: 5 },
            { value: 's', line: 2, column: 5 },
            { value: 't', line: 3, column: 5 },
        ];
        gameBoard.placeLetters(myWord);
        const mot: Word = validationCountingService.findBeforeWord(myWord[0].line, myWord[0].column, 'v');
        expect(mot.word).to.eql('');
    });
    it('findBeforeWord should not find a horizontal word if the first letter is in column 1', () => {
        const myWord: Letter[] = [
            { value: 't', line: 0, column: 0 },
            { value: 'e', line: 0, column: 1 },
            { value: 's', line: 0, column: 2 },
            { value: 't', line: 0, column: 3 },
        ];
        gameBoard.placeLetters(myWord);
        const mot: Word = validationCountingService.findBeforeWord(myWord[0].line, myWord[0].column, 'h');
        expect(mot.word).to.eql('');
    });
    it('findAfterWord should not find a vertical word if the last letter is in line O', () => {
        const myWord: Letter[] = [
            { value: 't', line: 11, column: 1 },
            { value: 'e', line: 12, column: 1 },
            { value: 's', line: 13, column: 1 },
            { value: 't', line: 14, column: 1 },
        ];
        gameBoard.placeLetters(myWord);
        const line = 14;
        const mot: string = validationCountingService.findAfterWord(line, 1, 'v');
        expect(mot).to.eql('');
    });
    it('findAfterWord should not find a horizontal word if the last letter is in column 15', () => {
        const myWord: Letter[] = [
            { value: 't', line: 2, column: 11 },
            { value: 'e', line: 2, column: 12 },
            { value: 's', line: 2, column: 13 },
            { value: 't', line: 2, column: 14 },
        ];
        gameBoard.placeLetters(myWord);
        const column = 14;
        const mot: string = validationCountingService.findAfterWord(2, column, 'h');
        expect(mot).to.eql('');
    });
    it('getCreatedWords should find all the new created word for each letter when placed vertically ', () => {
        const myWord: Letter[] = [
            { value: 'b', line: 2, column: 6 },
            { value: 'e', line: 3, column: 6 },
            { value: 't', line: 4, column: 6 },
            { value: 'i', line: 5, column: 6 },
            { value: 's', line: 6, column: 6 },
            { value: 'e', line: 7, column: 6 },
            { value: 's', line: 8, column: 6 },
        ];
        gameBoard.placeLetters(WORDS_CREATION_VERTICAL);
        const words: Word[] = validationCountingService.getCreatedWords('h', myWord);
        expect(words).to.eql(CREATED_WORDS);
    });
    it('getCreatedWords should find all the new created word for each letter when placed horizontally ', () => {
        const myWord: Letter[] = [
            { value: 'a', line: 8, column: 3 },
            { value: 'd', line: 8, column: 4 },
            { value: 'o', line: 8, column: 5 },
            { value: 'n', line: 8, column: 6 },
            { value: 'n', line: 8, column: 7 },
            { value: 'e', line: 8, column: 8 },
        ];
        gameBoard.placeLetters(WORDS_CREATION_HORIZONTAL);
        const createdWords: Word[] = [
            { word: 'ramer', lineStart: 7, columnStart: 3, direction: 'v' },
            { word: 'allo', lineStart: 5, columnStart: 5, direction: 'v' },
            { word: 'noir', lineStart: 8, columnStart: 6, direction: 'v' },
            { word: 'garee', lineStart: 4, columnStart: 8, direction: 'v' },
        ];
        const words: Word[] = validationCountingService.getCreatedWords('v', myWord);
        expect(words).to.eql(createdWords);
    });

    it('getAllWords should find all the words attached when only one letter is placed ', () => {
        const LETTERS_PLACED: Letter[] = [
            { value: 'e', line: 3, column: 8 },
            { value: 'n', line: 3, column: 9 },
            { value: 't', line: 3, column: 10 },
            { value: 'r', line: 3, column: 11 },
            { value: 'e', line: 3, column: 12 },
            { value: 'a', line: 4, column: 7 },
            { value: 's', line: 5, column: 7 },
        ];
        const myLetter: Letter[] = [{ value: 'v', line: 3, column: 7 }];
        gameBoard.placeLetters(LETTERS_PLACED);
        const createdWords: Word[] = [
            { word: 'ventre', lineStart: 3, columnStart: 7, direction: 'h' },
            { word: 'vas', lineStart: 3, columnStart: 7, direction: 'v' },
        ];
        const words: Word[] = validationCountingService.getAllWords(myLetter[0].line, myLetter[0].column, myLetter);
        expect(words).to.eql(createdWords);
    });
    it('getAllWords should find all the words attached when letters are placed ', () => {
        const LETTERS_PLACED: Letter[] = [
            { value: 'a', line: 3, column: 5 },
            { value: 'l', line: 4, column: 5 },
            { value: 'l', line: 5, column: 5 },
            { value: 'o', line: 6, column: 5 },
            { value: 'd', line: 6, column: 4 },
            { value: 'n', line: 6, column: 6 },
            { value: 'g', line: 2, column: 8 },
            { value: 'a', line: 3, column: 8 },
            { value: 'r', line: 4, column: 8 },
            { value: 'e', line: 5, column: 8 },
        ];
        const myLetter: Letter[] = [
            { value: 'a', line: 6, column: 3 },
            { value: 'n', line: 6, column: 7 },
            { value: 'e', line: 6, column: 8 },
            { value: 'r', line: 6, column: 9 },
            { value: 'a', line: 6, column: 10 },
            { value: 'i', line: 6, column: 11 },
        ];
        gameBoard.placeLetters(LETTERS_PLACED);
        const createdWords: Word[] = [
            { word: 'adonnerai', lineStart: 6, columnStart: 3, direction: 'h' },
            { word: 'garee', lineStart: 2, columnStart: 8, direction: 'v' },
        ];
        const words: Word[] = validationCountingService.getAllWords(myLetter[0].line, myLetter[0].column, myLetter);
        expect(words).to.eql(createdWords);
    });
    it('verifyWords should return true when a word is contained in the dictionary ', () => {
        const validWords: Word[] = [
            { word: 'ventre', lineStart: 3, columnStart: 7, direction: 'h' },
            { word: 'vas', lineStart: 3, columnStart: 7, direction: 'v' },
        ];
        const validation: boolean = validationCountingService.verifyWords(validWords);
        expect(validation).to.eql(true);
    });
    it('verifyWords should return false when a word is  not contained in the dictionary ', () => {
        const validWords: Word[] = [
            { word: 'ventr', lineStart: 3, columnStart: 7, direction: 'h' },
            { word: 'vas', lineStart: 3, columnStart: 7, direction: 'v' },
        ];
        const validation: boolean = validationCountingService.verifyWords(validWords);
        expect(validation).to.eql(false);
    });
    it('calculateWordsPoints should double the point of a letter if the letter is in a light blue tile and not used ', () => {
        const words: Word[] = [{ word: 'ventre', lineStart: 6, columnStart: 2, direction: 'h' }];
        const fourNumber = 4;
        const DOUBLE_V_POINT = 2 * fourNumber;
        const DOUBLE_R_POINT = 2 * 1;
        const E_N_T_POINT = 1;
        const wordPoint = DOUBLE_V_POINT + DOUBLE_R_POINT + fourNumber * E_N_T_POINT;
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(wordPoint);
    });
    it('calculateWordsPoints should triple the point of a letter if the letter is in a dark blue tile and not used ', () => {
        const words: Word[] = [{ word: 'ventre', lineStart: 5, columnStart: 1, direction: 'v' }];
        const fourNumber = 4;
        const TRIPLE_V_POINT = 3 * fourNumber;
        const TRIPLE_R_POINT = 3 * 1;
        const E_N_T_POINT = 1;
        const wordPoint = TRIPLE_V_POINT + TRIPLE_R_POINT + fourNumber * E_N_T_POINT;
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(wordPoint);
    });
    it('calculateWordsPoints should double the word points  if one of the letters is in a 2x word tile and not used ', () => {
        const words: Word[] = [{ word: 'ventre', lineStart: 2, columnStart: 0, direction: 'h' }];
        const V_POINT = 4;
        const E_N_T_R_POINT = 1;
        const fiveNumber = 5;
        const wordPoint = 2 * (V_POINT + fiveNumber * E_N_T_R_POINT);
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(wordPoint);
    });
    it('calculateWordsPoints should triple the word points in a 3x word tile with one of the letters is in a 2x letter tile and not used ', () => {
        const words: Word[] = [{ word: 'zebre', lineStart: 0, columnStart: 0, direction: 'v' }];
        const Z_POINT = 10;
        const B_POINT = 3;
        const E_R_POINT = 1;
        const DOUBLE_R = 2 * E_R_POINT;
        const wordPoint = 3 * (Z_POINT + B_POINT + DOUBLE_R + 2 * E_R_POINT);
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(wordPoint);
    });
    it('calculateWordsPoints should quadruple the word points if 2 letters in a 2x word and add a 50 bonus for 7 letters used ', () => {
        const words: Word[] = [{ word: 'huchees', lineStart: 4, columnStart: 4, direction: 'v' }];
        const H_POINT = 4;
        const C_POINT = 3;
        const E_U_S_POINT = 1;
        const bonusPoint = 50;
        const fourNumber = 4;
        const wordPoint = fourNumber * (2 * H_POINT + C_POINT + fourNumber * E_U_S_POINT) + bonusPoint;
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(wordPoint);
    });
    it('calculateWordsPoints should get the points of multiple new words with differents multiplicators ', () => {
        const words: Word[] = [
            { word: 'huchees', lineStart: 4, columnStart: 4, direction: 'v' },
            { word: 'insolez', lineStart: 7, columnStart: 3, direction: 'h' },
            { word: 'labo', lineStart: 0, columnStart: 7, direction: 'v' },
        ];
        const H_POINT = 4;
        const Z_POINT = 10;
        const B_C_POINT = 3;
        const fiveNumber = 5;
        const fourNumber = 4;
        const E_U_S_L_A_O_I_N_POINT = 1;
        const hucheesWordPoint = fourNumber * (2 * H_POINT + B_C_POINT + fourNumber * E_U_S_L_A_O_I_N_POINT);
        const insolezWordPoint = 2 * (2 * E_U_S_L_A_O_I_N_POINT + fiveNumber * E_U_S_L_A_O_I_N_POINT + Z_POINT);
        const laboWordPoint = 3 * (2 * E_U_S_L_A_O_I_N_POINT + 2 * E_U_S_L_A_O_I_N_POINT + B_C_POINT);
        const totalPoints = hucheesWordPoint + insolezWordPoint + laboWordPoint + BONUS_POINT;
        const functionPoint = validationCountingService.calculateWordsPoints(words, words[0].word.length);
        expect(functionPoint).to.eql(totalPoints);
    });
    it('calculateWordsPoints should not multiply the til multiplier if its not the placed letter ', () => {
        const word: Word[] = [{ word: 'labo', lineStart: 0, columnStart: 7, direction: 'v' }];
        const createdWord: Word[] = [{ word: 'laboratoire', lineStart: 0, columnStart: 7, direction: 'v' }];
        const LETTERS_WORD: Letter[] = [
            { value: 'l', line: 0, column: 7 },
            { value: 'a', line: 1, column: 7 },
            { value: 'b', line: 2, column: 7 },
            { value: 'o', line: 3, column: 7 },
        ];
        // place les lettres mais les multiplicateurs sont encore inutilisés
        gameBoard.placeLetters(LETTERS_WORD);
        // placer le mot labo qui va calculer les points avec les multiplicateurs
        validationCountingService.calculateWordsPoints(word, LETTERS_WORD.length);
        const B_C_POINT = 3;
        const R_E_U_S_L_A_O_I_N_POINT = 1;
        const tenNumber = 10;
        const laboratoireWordPoint = 2 * (tenNumber * R_E_U_S_L_A_O_I_N_POINT + B_C_POINT);
        // rajouter les lettres ratoire afin de créer laboratoire et ne pas compter les muiltiplicateurs de labo
        // car les lettres etaient deja presentes
        const placedWord = validationCountingService.calculateWordsPoints(createdWord, 1);
        expect(laboratoireWordPoint).to.eql(placedWord);
    });
    it('calculateWordsPoints should add 0 point when letter is a white letter', () => {
        const word: Word[] = [{ word: 'labo', lineStart: 0, columnStart: 7, direction: 'v' }];
        const createdWord: Word[] = [{ word: 'laboratoiRE', lineStart: 0, columnStart: 7, direction: 'v' }];
        const LETTERS_WORD: Letter[] = [
            { value: 'l', line: 0, column: 7 },
            { value: 'a', line: 1, column: 7 },
            { value: 'b', line: 2, column: 7 },
            { value: 'o', line: 3, column: 7 },
        ];
        // place les lettres mais les multiplicateurs sont encore inutilisés
        gameBoard.placeLetters(LETTERS_WORD);
        // placer le mot labo qui va calculer les points avec les multiplicateurs
        validationCountingService.calculateWordsPoints(word, LETTERS_WORD.length);
        const B_C_POINT = 3;
        const R_E_U_S_L_A_O_I_N_POINT = 1;
        const eightNumber = 8;
        const laboratoireWordPoint = 2 * (eightNumber * R_E_U_S_L_A_O_I_N_POINT + B_C_POINT);
        // rajouter les lettres ratoire afin de créer laboratoire et ne pas compter les muiltiplicateurs de labo
        // car les lettres etaient deja presentes
        const placedWord = validationCountingService.calculateWordsPoints(createdWord, 1);
        expect(laboratoireWordPoint).to.eql(placedWord);
    });
    it('verifyAndCalculateWords should find all the new words ,validate them and calculate correctly the points', () => {
        const myWord: Letter[] = [
            { value: 'b', line: 2, column: 6 },
            { value: 'e', line: 3, column: 6 },
            { value: 't', line: 4, column: 6 },
            { value: 'i', line: 5, column: 6 },
            { value: 's', line: 6, column: 6 },
            { value: 'e', line: 7, column: 6 },
            { value: 's', line: 8, column: 6 },
        ];
        gameBoard.placeLetters(WORDS_CREATION_VERTICAL);
        // placer le mot labo qui va calculer les points avec les multiplicateurs
        const fourteenPoints = 14;
        const BETISES_POINT = fourteenPoints + BONUS_POINT;
        const DE_POINT = 3;
        const ET_POINT = 2;
        const RIT_POINT = 3;
        const OSAIT_POINT = 6;
        const BEC_POINT = 7;
        const ES_POINT = 3;
        const realWordsPoint = BETISES_POINT + DE_POINT + ET_POINT + RIT_POINT + OSAIT_POINT + BEC_POINT + ES_POINT;
        const allWordsPoints = validationCountingService.verifyAndCalculateWords(myWord);
        expect(allWordsPoints).to.eql(realWordsPoint);
    });
    it('verifyAndCalculateWords should find all the new words and if a new word is invalid points are 0', () => {
        const myWord: Letter[] = [
            { value: 'r', line: 2, column: 6 },
            { value: 'a', line: 3, column: 6 },
            { value: 'm', line: 4, column: 6 },
            { value: 'e', line: 5, column: 6 },
            { value: 'r', line: 6, column: 6 },
        ];
        gameBoard.placeLetters(WORDS_CREATION_VERTICAL);
        // placer le mot labo qui va calculer les points avec les multiplicateurs
        const realWordsPoint = 0;
        const allWordsPoints = validationCountingService.verifyAndCalculateWords(myWord);
        expect(allWordsPoints).to.eql(realWordsPoint);
    });
    it('verifyAndCalculateWords should find all the new words and if a new word is invalid points are 0', () => {
        const myWord: Letter[] = [
            { value: 'r', line: 2, column: 6 },
            { value: 'a', line: 3, column: 6 },
            { value: 'm', line: 4, column: 6 },
            { value: 'e', line: 5, column: 6 },
            { value: 'r', line: 6, column: 6 },
        ];
        gameBoard.placeLetters(WORDS_CREATION_VERTICAL);
        // placer le mot labo qui va calculer les points avec les multiplicateurs
        const realWordsPoint = 0;
        const allWordsPoints = validationCountingService.verifyAndCalculateWords(myWord);
        expect(allWordsPoints).to.eql(realWordsPoint);
    });
    it('addGoalsPoints should add points to the first goal if its is verified', () => {
        const log = new ScrabbleLog2990();
        const logPlayer = new ScrabbleLog2990();
        const myWord: Letter[] = [
            { value: 'j', line: 2, column: 6 },
            { value: 'o', line: 3, column: 6 },
            { value: 'u', line: 4, column: 6 },
            { value: 'a', line: 5, column: 6 },
            { value: 'i', line: 6, column: 6 },
        ];
        log.goalsOfTheGame[0] = log.goals[0];
        const expectedPoints = 25;
        // logPlayer.goals[log.goalsOfTheGame[0].id - 1].isCompleted = true;
        // log.goalsOfTheGame[0].isCompleted = true;
        // logPlayer.goalsOfTheGame[0].isCompleted = true;

        // // log.goalsOfTheGame[0].id = 1;
        // log.goalsOfTheGame[0].points = 10;

        // log.goalsOfTheGame[1].isCompleted = true;
        // // log.goalsOfTheGame[1].id = 1;
        // log.goalsOfTheGame[1].points = 10;

        // logPlayer.goalsOfTheGame[0].isVerified = true;
        // log.privateGoal = { id: 1 } as Goal;
        logPlayer.privateGoal = { id: 1 } as Goal;
        const updatedPoints = validationCountingService.addGoalsPoints(myWord, log, logPlayer);
        expect(updatedPoints).to.equal(expectedPoints);
    });
    it('addGoalsPoints should add points to the second goal if its is verified', () => {
        const log = new ScrabbleLog2990();
        const logPlayer = new ScrabbleLog2990();
        const myWord: Letter[] = [
            { value: 'j', line: 2, column: 6 },
            { value: 'o', line: 3, column: 6 },
            { value: 'u', line: 4, column: 6 },
            { value: 'a', line: 5, column: 6 },
            { value: 'i', line: 6, column: 6 },
        ];
        log.goalsOfTheGame[0] = log.goals[2];
        log.goalsOfTheGame[1] = log.goals[0];
        const expectedPoints = 25;
        logPlayer.privateGoal = { id: 1 } as Goal;
        const updatedPoints = validationCountingService.addGoalsPoints(myWord, log, logPlayer);
        expect(updatedPoints).to.equal(expectedPoints);
    });
    it('addGoalsPoints should add points to the private goal if it is verified', () => {
        const log = new ScrabbleLog2990();
        const logPlayer = new ScrabbleLog2990();
        const myWord: Letter[] = [
            { value: 'j', line: 2, column: 6 },
            { value: 'o', line: 3, column: 6 },
            { value: 'u', line: 4, column: 6 },
            { value: 'a', line: 5, column: 6 },
            { value: 'i', line: 6, column: 6 },
        ];
        log.goalsOfTheGame[0] = log.goals[2];
        log.goalsOfTheGame[1] = log.goals[1];
        logPlayer.privateGoal = logPlayer.goals[0];
        logPlayer.privateGoal.id = 1;
        const expectedPoints = 25;
        const updatedPoints = validationCountingService.addGoalsPoints(myWord, log, logPlayer);
        expect(updatedPoints).to.equal(expectedPoints);
    });
});
