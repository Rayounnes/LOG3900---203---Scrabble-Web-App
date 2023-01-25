/* eslint-disable max-lines */
// Test depassent les lignes
import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import { HintWordsService } from './hint-words.service';
import { Board } from '@app/classes/board';
import { Letter } from '@app/interfaces/lettre';
import { ValidationCountingWordsService } from './counting-validating-points.service';
import { ReserveService } from './reserve.service';
import { ChevaletService } from './chevalet.service';
import { INVALID_PLACEMENT, WORDS_ONE_WHITE_LETTER, WORDS_TWO_WHITE_LETTER } from '@app/constants/hint-constants';
import { POINTS } from '@app/constants/constants';
import { Placement } from '@app/interfaces/placement';
describe('HintWordsService', () => {
    let service: HintWordsService;
    let reserveService: ReserveService;
    let board: Board;
    let validationCountService: ValidationCountingWordsService;
    let chevaletService: ChevaletService;
    let fileName: string;
    beforeEach(() => {
        reserveService = new ReserveService();
        board = new Board();
        fileName = 'dictionnary.json';
        validationCountService = new ValidationCountingWordsService(board, fileName);
        chevaletService = new ChevaletService(reserveService);
        service = new HintWordsService(chevaletService, validationCountService, board);
    });
    it('should be created', () => {
        assert.isDefined(service);
    });

    it('canBeWord should return false if no vowels where found in the word', () => {
        const word = ['b', 'c', 'v', 'f', 'g'];
        const valid = service.canBeWord(word);
        expect(valid).to.eql(false);
    });
    it('canBeWord should return false if no consumns where found in the word', () => {
        const word = ['a', 'e', 'o', 'o', 'i'];
        const valid = service.canBeWord(word);
        expect(valid).to.eql(false);
    });
    it('canBeWord should return true if the double of vowels are greater than consumns', () => {
        const word = ['a', 'e', 'm', 'b', 'l'];
        const valid = service.canBeWord(word);
        expect(valid).to.eql(true);
    });
    it('canBeWord should return false if the double of vowels are not greater than consumns', () => {
        const word = ['a', 'v', 'm', 'b', 'l'];
        const valid = service.canBeWord(word);
        expect(valid).to.eql(false);
    });
    it('getAllWordswithWhiteLetter should return all the possible words when one white letter is present', () => {
        const word = 'avm*l';
        const valid = service.getWhiteLetterWords(word);
        expect(valid).to.eql(WORDS_ONE_WHITE_LETTER);
    });
    it('getAllWordswithWhiteLetter should return all the possible words when two white letter is present', () => {
        const word = ['*', 'v', 'm', '*', 'l'];
        const whiteLetters = 2;
        const valid = service.getAllWordswithWhiteLetter(word, whiteLetters);
        expect(valid).to.eql(WORDS_TWO_WHITE_LETTER);
    });
    it('printCombination should return all the possible combination for a word', () => {
        const word = ['a', 'b', 'c'];
        const expectedComb = [['a', 'b', 'c'], ['a', 'b'], ['a', 'c'], ['b', 'c'], ['a'], ['b'], ['c']];
        const combinaison: string[][] = [];
        service.printCombination(word, word.length, 3, combinaison);
        service.printCombination(word, word.length, 2, combinaison);
        service.printCombination(word, word.length, 1, combinaison);
        expect(combinaison).to.eql(expectedComb);
    });
    it('printCombination should return all the possible combination for a word with white letter', () => {
        const spyWhiteLetters = sinon.spy(service, 'getAllWordswithWhiteLetter');
        const word = ['a', 'b', '*'];
        const combinaison: string[][] = [];
        service.printCombination(word, word.length, 3, combinaison);
        assert(spyWhiteLetters.called);
    });
    it('permutator should return all the possible permutation for a word', () => {
        const word = ['a', 'b', 'c'];
        const expectedComb = ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'];
        const combinaison: string[] = service.permutator(word);
        expect(combinaison).to.eql(expectedComb);
    });
    it('getCombinationPositions should find a valid positions for the letters when its first turn', () => {
        const lettersPositions: Letter[][] = [
            [
                { value: 't', line: 7, column: 7 },
                { value: 'e', line: 7, column: 8 },
                { value: 's', line: 7, column: 9 },
                { value: 't', line: 7, column: 10 },
            ],
        ];
        const word = 'test';
        const positions: Letter[][] = service.getCombinationPositions(true, word);
        expect(positions).to.eql(lettersPositions);
    });
    it('getCombinationPositions should find all the valid positions for the letters when not first turn', () => {
        const lettersPlaced: Letter[] = [{ value: 'a', line: 7, column: 7 }];
        const lettersPositions: Letter[][] = [
            [
                { value: 'w', line: 5, column: 7 },
                { value: 'o', line: 6, column: 7 },
            ],
            [
                { value: 'w', line: 6, column: 6 },
                { value: 'o', line: 6, column: 7 },
            ],
            [
                { value: 'w', line: 6, column: 6 },
                { value: 'o', line: 7, column: 6 },
            ],
            [
                { value: 'w', line: 6, column: 7 },
                { value: 'o', line: 6, column: 8 },
            ],
            [
                { value: 'w', line: 6, column: 7 },
                { value: 'o', line: 8, column: 7 },
            ],
            [
                { value: 'w', line: 6, column: 8 },
                { value: 'o', line: 7, column: 8 },
            ],
            [
                { value: 'w', line: 7, column: 5 },
                { value: 'o', line: 7, column: 6 },
            ],
            [
                { value: 'w', line: 7, column: 6 },
                { value: 'o', line: 7, column: 8 },
            ],
            [
                { value: 'w', line: 7, column: 6 },
                { value: 'o', line: 8, column: 6 },
            ],
            [
                { value: 'w', line: 7, column: 8 },
                { value: 'o', line: 7, column: 9 },
            ],
            [
                { value: 'w', line: 7, column: 8 },
                { value: 'o', line: 8, column: 8 },
            ],
            [
                { value: 'w', line: 8, column: 6 },
                { value: 'o', line: 8, column: 7 },
            ],
            [
                { value: 'w', line: 8, column: 7 },
                { value: 'o', line: 8, column: 8 },
            ],
            [
                { value: 'w', line: 8, column: 7 },
                { value: 'o', line: 9, column: 7 },
            ],
        ];
        board.placeLetters(lettersPlaced);
        const word = 'wo';
        const positions: Letter[][] = service.getCombinationPositions(false, word);
        expect(positions).to.eql(lettersPositions);
    });
    it('getValidWord should verify if the words created with permutation are valid and return false if no valid word found', () => {
        const lettersPlaced: Letter[] = [{ value: 'x', line: 7, column: 7 }];
        board.placeLetters(lettersPlaced);
        const words = ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'];
        const notValid = service.getValidWord(false, words);
        expect(notValid).to.eql(undefined);
    });
    it('getValidWord should verify if the words created with permutation are valid and return the valid word positions', () => {
        const lettersPlaced: Letter[] = [{ value: 'e', line: 7, column: 7 }];
        board.placeLetters(lettersPlaced);
        const lettersPositions: Letter[] = [
            { value: 't', line: 6, column: 7 },
            { value: 's', line: 8, column: 7 },
            { value: 't', line: 9, column: 7 },
        ];
        const words = ['stt', 'tst'];
        const valid = service.getValidWord(false, words);
        expect(valid).to.eql(lettersPositions);
    });
    it('getValidWord should pass the 1 letter word when first turn', () => {
        const words = ['a', 'b', 'c'];
        const notValid = service.getValidWord(true, words);
        expect(notValid).to.eql(undefined);
    });
    it('isTheSameWord should return false when a word is not in the set of valid words', () => {
        const word: Letter[] = [
            { value: 't', line: 7, column: 7 },
            { value: 'o', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
        ];
        const validWords = new Set<Letter[]>();
        validWords.add([
            { value: 't', line: 7, column: 7 },
            { value: 'e', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
            { value: 's', line: 7, column: 11 },
        ]);
        validWords.add([
            { value: 't', line: 7, column: 7 },
            { value: 'e', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
        ]);
        validWords.add([
            { value: 't', line: 7, column: 7 },
            { value: 'o', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 12 },
        ]);
        validWords.add([
            { value: 't', line: 7, column: 7 },
            { value: 'o', line: 8, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
        ]);
        const isInValid: boolean = service.isTheSameWord(word, validWords);
        expect(isInValid).to.eql(false);
    });
    it('isTheSameWord should return true when a word is in the set of valid words', () => {
        const word: Letter[] = [
            { value: 't', line: 7, column: 7 },
            { value: 'o', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
        ];
        const validWords = new Set<Letter[]>();
        validWords.add([
            { value: 't', line: 7, column: 7 },
            { value: 'o', line: 7, column: 8 },
            { value: 's', line: 7, column: 9 },
            { value: 't', line: 7, column: 10 },
        ]);
        const isValid: boolean = service.isTheSameWord(word, validWords);
        expect(isValid).to.eql(true);
    });
    it('getAllWords should find all valid words with a max of 3 words ', () => {
        const word: Letter[] = [
            { value: 'p', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 't', line: 7, column: 9 },
            { value: 'e', line: 7, column: 10 },
        ];
        board.placeLetters(word);
        const rackLetters = 'fxsreta';
        const stubRack = sinon.stub(chevaletService, 'rackInString').get(() => rackLetters);
        const validWordsExpected = new Set<Letter[]>();
        validWordsExpected.add([
            { line: 3, column: 10, value: 'f' },
            { line: 4, column: 10, value: 'a' },
            { line: 5, column: 10, value: 'x' },
            { line: 6, column: 10, value: 'e' },
            { line: 8, column: 10, value: 's' },
        ]);
        validWordsExpected.add([
            { line: 6, column: 8, value: 'f' },
            { line: 8, column: 8, value: 'x' },
            { line: 9, column: 8, value: 'e' },
            { line: 10, column: 8, value: 'r' },
            { line: 11, column: 8, value: 'a' },
        ]);
        validWordsExpected.add([
            { line: 4, column: 9, value: 'f' },
            { line: 5, column: 9, value: 'r' },
            { line: 6, column: 9, value: 'e' },
            { line: 8, column: 9, value: 'a' },
            { line: 9, column: 9, value: 's' },
        ]);
        const validWords: Set<Letter[]> = service.getAllWords(false);
        expect(validWords).to.eql(validWordsExpected);
        stubRack.restore();
    });
    it('wordToCommand should transform word to place command', () => {
        const word: Letter[] = [
            { value: 'p', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 't', line: 7, column: 9 },
            { value: 'e', line: 7, column: 10 },
        ];
        const expectedCommand = '!placer h8h pate';
        const command: string = service.wordToCommand(word);
        expect(command).to.eql(expectedCommand);
    });
    it('hintPlacement should return 3 command placements if found', () => {
        const word: Letter[] = [
            { value: 'p', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 't', line: 7, column: 9 },
            { value: 'e', line: 7, column: 10 },
        ];
        board.placeLetters(word);
        const rackLetters = 'fxsreta';
        const stubRack = sinon.stub(chevaletService, 'rackInString').get(() => rackLetters);
        const expectedCommands = '!placer d11v faxes\n!placer g9v fxera\n!placer e10v freas';
        const commands: string = service.hintPlacement(false);
        expect(commands).to.eql(expectedCommands);
        stubRack.restore();
    });
    it('hintPlacement should return a message if less than 3 command placements found', () => {
        const word: Letter[] = [
            { value: 'p', line: 7, column: 7 },
            { value: 'a', line: 7, column: 8 },
            { value: 't', line: 7, column: 9 },
            { value: 'e', line: 7, column: 10 },
        ];
        board.placeLetters(word);
        const rackLetters = 's';
        const stubRack = sinon.stub(chevaletService, 'rackInString').get(() => rackLetters);
        const expectedCommands = 'Ces seuls placements ont été trouvés: \n!placer g9 s';
        const commands: string = service.hintPlacement(false);
        expect(commands).to.eql(expectedCommands);
        stubRack.restore();
    });
    it('hintPlacement should return a message if no command placements found', () => {
        const stubHint = sinon.stub(service, 'getAllWords').returns(new Set<Letter[]>());
        const expectedCommands = "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !";
        const commands: string = service.hintPlacement(false);
        expect(commands).to.eql(expectedCommands);
        stubHint.restore();
    });
    it('getValidWordPoints should verify if the words created with permutation are valid and points between six or less', () => {
        const pointsScale = service.pointsScoreBetween(POINTS.SixOrLess);
        const placement: Placement = {
            letters: [
                { value: 'l', line: 7, column: 7 },
                { value: 'e', line: 7, column: 8 },
            ],
            points: 4,
            command: '',
        };
        const words = ['le', 'l', 'e'];
        const valid = service.getValidWordPoints(true, words, pointsScale);
        expect(valid).to.eql(placement);
    });
    it('getValidWordPoints should verify if the words created with permutation are valid and points between seven to twelve', () => {
        const pointsScale = service.pointsScoreBetween(POINTS.SevenToTwelve);
        const placement: Placement = {
            letters: [
                { value: 't', line: 7, column: 7 },
                { value: 'e', line: 7, column: 8 },
                { value: 's', line: 7, column: 9 },
                { value: 't', line: 7, column: 10 },
            ],
            points: 8,
            command: '',
        };
        const words = ['t', 'stt', 'test'];
        const valid = service.getValidWordPoints(true, words, pointsScale);
        expect(valid).to.eql(placement);
    });
    it('getAllWordsInPointsScale should return a maximum of 10 placements with differents points in the points scale', () => {
        const word: Letter[] = [{ value: 'a', line: 7, column: 1 }];
        board.placeLetters(word);
        const rackLetters = 'pat';
        const stubRack = sinon.stub(chevaletService, 'rackInString').get(() => rackLetters);
        const expectPlacements: Placement[] = [
            {
                letters: [
                    { value: 'p', line: 6, column: 2 },
                    { value: 'a', line: 7, column: 2 },
                    { value: 't', line: 8, column: 2 },
                ],
                points: 15,
                command: '',
            },
        ];
        const placements: Placement[] = service.getAllWordsInPointsScale(false, POINTS.ThirteenToEighteen);
        expect(placements).to.eql(expectPlacements);
        stubRack.restore();
    });
    it('getMostWordPoints should return the biggest score placement of the permutations', () => {
        const permutations: string[] = ['a', 'b', 'pat', 'mangez', 'boire', 'buvez', 'nickels'];
        const expectPlacements: Placement = {
            letters: [
                { line: 7, column: 7, value: 'n' },
                { line: 7, column: 8, value: 'i' },
                { line: 7, column: 9, value: 'c' },
                { line: 7, column: 10, value: 'k' },
                { line: 7, column: 11, value: 'e' },
                { line: 7, column: 12, value: 'l' },
                { line: 7, column: 13, value: 's' },
            ],
            points: 88,
            command: '',
        };
        const placement: Placement = service.getMostWordPoints(true, permutations);
        expect(placement).to.eql(expectPlacements);
    });
    it('getCombMostPoint should call permutator and getMostWordPoints and return invalid placement if no placement found', () => {
        const stubWordPoints = sinon.stub(service, 'getMostWordPoints').returns(INVALID_PLACEMENT);
        const spyPermutator = sinon.spy(service, 'permutator');
        const combinations: string[] = ['te', 'test', 'tset'];
        const placement: Placement = service.getCombMostPoint(true, combinations);
        expect(placement).to.eql(INVALID_PLACEMENT);
        assert(stubWordPoints.called);
        assert(spyPermutator.called);
        stubWordPoints.restore();
    });
    it('getCombMostPoint should return the best placement when found', () => {
        const placement: Placement = {
            letters: [
                { line: 7, column: 7, value: 'n' },
                { line: 7, column: 8, value: 'i' },
                { line: 7, column: 9, value: 'c' },
                { line: 7, column: 10, value: 'k' },
                { line: 7, column: 11, value: 'e' },
                { line: 7, column: 12, value: 'l' },
                { line: 7, column: 13, value: 's' },
            ],
            points: 88,
            command: '',
        };
        const stubWordPoints = sinon.stub(service, 'getMostWordPoints').returns(placement);
        const combinations: string[] = ['te', 'test', 'tset'];
        const placementFound: Placement = service.getCombMostPoint(true, combinations);
        expect(placementFound).to.eql(placementFound);
        stubWordPoints.restore();
    });
    it('getMostPointsPlacement should return the best placement depending on the player rack and board', () => {
        const rackLetters = 'eeusgil';
        const stubRack = sinon.stub(chevaletService, 'rackInString').get(() => rackLetters);
        const placement: Placement = {
            letters: [
                { line: 7, column: 7, value: 'l' },
                { line: 7, column: 8, value: 'i' },
                { line: 7, column: 9, value: 'g' },
                { line: 7, column: 10, value: 'u' },
                { line: 7, column: 11, value: 'e' },
                { line: 7, column: 12, value: 'e' },
                { line: 7, column: 13, value: 's' },
            ],
            points: 68,
            command: '',
        };
        const placementFound: Placement = service.getMostPointsPlacement(true);
        expect(placementFound).to.eql(placement);
        stubRack.restore();
    });
});
