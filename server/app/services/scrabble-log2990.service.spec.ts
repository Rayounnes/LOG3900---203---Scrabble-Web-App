/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { expect, assert } from 'chai';
import { ScrabbleLog2990 } from './scrabble-log2990.service';
import { Word } from '@app/interfaces/word';
import { Letter } from '@app/interfaces/lettre';
import sinon = require('sinon');

describe('ReserveService', () => {
    let service: ScrabbleLog2990;
    let wordTest: Word[];
    let lettersTest: Letter[];
    beforeEach(() => {
        service = new ScrabbleLog2990();
    });

    it('should be created', () => {
        assert.isDefined(service);
    });

    it('verifyObjectif1 should set isCompleted to true if there is 4 vowels', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
            { word: 'couloir', lineStart: 7, columnStart: 9, direction: 'h' },
        ];
        service.verifyObjectif1(wordTest);
        expect(service.goals[0].isCompleted).to.eql(true);
    });

    it('verifyObjectif1 should set isCompleted to false if there is less than 4 vowels', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
            { word: 'sale', lineStart: 7, columnStart: 9, direction: 'h' },
        ];
        service.verifyObjectif1(wordTest);
        expect(service.goals[0].isCompleted).to.eql(false);
    });

    it('countVowels should return the correct number of vowels', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
            { word: 'sale', lineStart: 7, columnStart: 9, direction: 'h' },
        ];
        const numberOfVowels = service.countVowels(wordTest[0]);
        expect(numberOfVowels).to.eql(2);
    });

    it('isVowel should return true if the letter is a vowel', () => {
        const letter = 'a';
        const isVowel = service.isVowel(letter);
        expect(isVowel).to.eql(true);
    });

    it('verifyObjectif2 should set isCompleted to true if the placement creates 3 words', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
            { word: 'sale', lineStart: 7, columnStart: 9, direction: 'h' },
        ];
        service.verifyObjectif2(wordTest);
        expect(service.goals[1].isCompleted).to.eql(true);
    });

    it('verifyObjectif2 should set isCompleted to false if the placement doesnt create 3 words', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.verifyObjectif2(wordTest);
        expect(service.goals[1].isCompleted).to.eql(false);
    });

    it('verifyObjectif3 should set isCompleted to true if the placement create a word of 10 letters', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'accommoder', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.verifyObjectif3(wordTest);
        expect(service.goals[2].isCompleted).to.eql(true);
    });

    it('verifyObjectif3 should set isCompleted to false if the placement doesnt create a word of 10 letters', () => {
        wordTest = [
            { word: 'salut', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'marche', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.verifyObjectif3(wordTest);
        expect(service.goals[2].isCompleted).to.eql(false);
    });

    it('verifyObjectif4 should set isCompleted to true if the placement worth more than 20 points 3 times in a row', () => {
        // service.cptObj4 = 3;
        for (let i = 0; i < 2; i++) {
            service.incrementCpt4(30);
        }
        service.verifyObjectif4(30);
        expect(service.goals[3].isCompleted).to.eql(true);
    });

    it('verifyObjectif4 should set isCompleted to false if the placement worth more than 20 points 3 times in a row', () => {
        service.verifyObjectif4(30);
        expect(service.goals[3].isCompleted).to.eql(false);
    });

    it('incrementeCpt4 should incremente cpt if its upper than 20', () => {
        service.incrementCpt4(30);
        expect(service.cptObj4).to.eql(1);
    });

    it('incrementeCpt4 should not incremente cpt if its lower than 20', () => {
        service.incrementCpt4(7);
        expect(service.cptObj4).to.eql(0);
    });

    it('verifyObjectif5 should set isCompleted to true if the placement is on mot x3 and lettre x2', () => {
        lettersTest = [
            { line: 0, column: 0, value: 's' },
            { line: 0, column: 1, value: 'a' },
            { line: 0, column: 2, value: 'l' },
            { line: 0, column: 3, value: 'e' },
        ];
        service.verifyObjectif5(lettersTest);
        expect(service.goals[4].isCompleted).to.eql(true);
    });

    it('verifyObjectif5 should set isCompleted to false if the placement is not on mot x3 and lettre x2', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        service.verifyObjectif5(lettersTest);
        expect(service.goals[4].isCompleted).to.eql(false);
    });

    it('verifyWordMultiplier should return true if the letter is on mot x3', () => {
        const letter: Letter = { line: 0, column: 0, value: 'a' };
        const result = service.verifyWordMultiplier(letter);
        expect(result).to.eql(true);
    });

    it('verifyWordMultiplier should return false if the letter is not on mot x3', () => {
        const letter: Letter = { line: 1, column: 1, value: 'a' };
        const result = service.verifyWordMultiplier(letter);
        expect(result).to.eql(false);
    });

    it('verifyLetterMultiplier should return true if the letter is on letter x2', () => {
        const letter: Letter = { line: 0, column: 3, value: 'a' };
        const result = service.verifyLetterMultiplier(letter);
        expect(result).to.eql(true);
    });

    it('verifyLetterMultiplier should return false if the letter is not on letter x2', () => {
        const letter: Letter = { line: 1, column: 3, value: 'a' };
        const result = service.verifyLetterMultiplier(letter);
        expect(result).to.eql(false);
    });

    it('verifyObjectif6 should set isCompleted to true if the placement create word with y and z', () => {
        wordTest = [
            { word: 'ayez', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.verifyObjectif6(wordTest);
        expect(service.goals[5].isCompleted).to.eql(true);
    });

    it('verifyObjectif6 should set isCompleted to false if the placement doesnt create word with y and z', () => {
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.verifyObjectif6(wordTest);
        expect(service.goals[5].isCompleted).to.eql(false);
    });

    it('verifyLetterY should return true if there is a y in the word', () => {
        const word: Word = { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' };
        const result = service.verifyLetterY(word);
        expect(result).to.eql(true);
    });

    it('verifyLetterY should return false if there is not a y in the word', () => {
        const word: Word = { word: 'manger', lineStart: 4, columnStart: 5, direction: 'h' };
        const result = service.verifyLetterY(word);
        expect(result).to.eql(false);
    });

    it('verifyLetterZ should return true if there is a z in the word', () => {
        const word: Word = { word: 'zoo', lineStart: 4, columnStart: 5, direction: 'h' };
        const result = service.verifyLetterZ(word);
        expect(result).to.eql(true);
    });

    it('verifyLetterZ should return false if there is not a z in the word', () => {
        const word: Word = { word: 'manger', lineStart: 4, columnStart: 5, direction: 'h' };
        const result = service.verifyLetterZ(word);
        expect(result).to.eql(false);
    });

    it('verifyObjectif7 should set isCompleted to true if we skip exchange 4 times in a row', () => {
        for (let i = 0; i < 3; i++) {
            service.incrementExchange();
        }
        service.verifyObjectif7();
        expect(service.goals[6].isCompleted).to.eql(true);
    });

    it('verifyObjectif7 should set isCompleted to false if we skip exchange 1 time', () => {
        service.verifyObjectif7();
        expect(service.goals[6].isCompleted).to.eql(false);
    });

    it('resetExchange should set the counterExchange to 0', () => {
        service.cptExchange = 3;
        service.resetExchange();
        expect(service.cptExchange).to.eql(0);
    });

    it('incrementExchange should increment the counter if isExchange is false', () => {
        service.isExchange = false;
        service.cptExchange = 0;
        service.incrementExchange();
        expect(service.cptExchange).to.eql(1);
    });

    it('incrementExchange should not increment the counter if isExchange is true', () => {
        service.isExchange = true;
        service.cptExchange = 5;
        service.incrementExchange();
        expect(service.cptExchange).to.eql(0);
    });

    it('verifyObjectif8 should set isCompleted to true if the number of tiles is upper than 25', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        service.cptTiles = 30;
        service.verifyObjectif8(lettersTest);
        expect(service.goals[7].isCompleted).to.eql(true);
    });

    it('verifyObjectif8 should set isCompleted to true if the number of tiles is upper than 25', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        service.cptTiles = 10;
        service.verifyObjectif8(lettersTest);
        expect(service.goals[7].isCompleted).to.eql(false);
    });

    it('findPrivateGoalsOfGame should call randomPrivateGoals', () => {
        const spyRandomPrivateGoals = sinon.spy(service, 'randomPrivateGoals');
        service.findPrivateGoalsOfGame();
        assert(spyRandomPrivateGoals.called);
    });

    it('findPublicGoalsOfGame should call randomPublicGoals', () => {
        const spyRandomPublicGoals = sinon.spy(service, 'randomPublicGoals');
        service.findPublicGoalsOfGame();
        assert(spyRandomPublicGoals.called);
    });

    it('verificationForEachGoal should call verifyObjectif1 if case1', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif1 = sinon.spy(service, 'verifyObjectif1');
        service.verificationForEachGoal(1, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif1.called);
    });

    it('verificationForEachGoal should call verifyObjectif2 if case2', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif2 = sinon.spy(service, 'verifyObjectif2');
        service.verificationForEachGoal(2, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif2.called);
    });

    it('verificationForEachGoal should call verifyObjectif3 if case3', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif3 = sinon.spy(service, 'verifyObjectif3');
        service.verificationForEachGoal(3, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif3.called);
    });

    it('verificationForEachGoal should call verifyObjectif4 if case4', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif4 = sinon.spy(service, 'verifyObjectif4');
        service.verificationForEachGoal(4, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif4.called);
    });

    it('verificationForEachGoal should call verifyObjectif5 if case5', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif5 = sinon.spy(service, 'verifyObjectif5');
        service.verificationForEachGoal(5, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif5.called);
    });

    it('verificationForEachGoal should call verifyObjectif6 if case6', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif6 = sinon.spy(service, 'verifyObjectif6');
        service.verificationForEachGoal(6, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif6.called);
    });

    it('verificationForEachGoal should call verifyObjectif7 if case7', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif7 = sinon.spy(service, 'verifyObjectif7');
        service.verificationForEachGoal(7, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif7.called);
    });

    it('verificationForEachGoal should call verifyObjectif8 if case8', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        const spyVerifyObjectif8 = sinon.spy(service, 'verifyObjectif8');
        service.verificationForEachGoal(8, wordTest, 30, lettersTest);
        assert(spyVerifyObjectif8.called);
    });

    it('verificationIsCompleted should call verificationForEachGoal', () => {
        lettersTest = [
            { line: 1, column: 0, value: 's' },
            { line: 1, column: 1, value: 'a' },
            { line: 1, column: 2, value: 'l' },
            { line: 1, column: 3, value: 'e' },
        ];
        wordTest = [
            { word: 'psy', lineStart: 4, columnStart: 5, direction: 'h' },
            { word: 'zoo', lineStart: 5, columnStart: 5, direction: 'v' },
        ];
        service.goalsOfTheGame = [service.goals[1], service.goals[6]];
        service.privateGoal = service.goals[3];
        const spyVerificationForEachGoal = sinon.spy(service, 'verificationForEachGoal');
        service.verificationIsCompleted(wordTest, 30, lettersTest);
        assert(spyVerificationForEachGoal.called);
    });
});
