import { Board } from '@app/classes/board';
import { Letter } from '@app/interfaces/lettre';
import { Placement } from '@app/interfaces/placement';
import {
    ALPHABET,
    DIRECTIONS,
    END_COLUMN_BOARD,
    HALF_INDEX_BOARD,
    HORIZONTAL,
    MAX_HINT_LENGTH,
    POINTS,
    START_INDEX_BOARD,
    VERTICAL,
    VOWELS,
} from '@app/constants/constants';
import { MAX_FOUND_WORDS, MIN_LETTERS_WITHOUT_VERIFICATION, WHITE_LETTER, INVALID_PLACEMENT } from '@app/constants/hint-constants';
import { ValidationCountingWordsService } from '@app/services/counting-validating-points.service';
import { Service } from 'typedi';
import { ChevaletService } from './chevalet.service';

type PointVerification = (arg0: number) => boolean;
const MAX_PLACEMENTS_VIRTUAL_PLAYER = 10;
@Service()
export class HintWordsService {
    numPlacementsVirtualPlayer = MAX_PLACEMENTS_VIRTUAL_PLAYER;
    constructor(private rackPlayer: ChevaletService, private validationService: ValidationCountingWordsService, private board: Board) {}
    canBeWord(combination: string[]): boolean {
        if (combination.length <= MIN_LETTERS_WITHOUT_VERIFICATION) return true;
        let vowels = 0;
        let consumns = 0;
        const word: string = combination.join('');
        for (const letter of word) {
            if (VOWELS.includes(letter) || letter === WHITE_LETTER) vowels += 1;
            else consumns += 1;
        }
        return !(vowels === 0 || consumns === 0 || vowels * 2 < consumns);
    }
    notSamePoints(placement: Placement, combinations: Placement[]): boolean {
        for (const comb of combinations) {
            if (comb.points === placement.points) return false;
        }
        return true;
    }
    getWhiteLetterWords(comb: string): string[][] {
        const allCombs: string[][] = [];
        for (const letter of ALPHABET) {
            const replacedComb: string = comb.replace(WHITE_LETTER, letter);
            allCombs.push(replacedComb.split(''));
        }
        return allCombs;
    }
    getAllWordswithWhiteLetter(combination: string[], whiteLettersNumb: number): string[][] {
        const comb = combination.join('');
        const allCombs: string[][] = this.getWhiteLetterWords(comb);
        if (whiteLettersNumb === 2) {
            let newCombs: string[][] = [];
            for (const newComb of allCombs) {
                newCombs = newCombs.concat(this.getWhiteLetterWords(newComb.join('')));
            }
            return newCombs;
        }
        return allCombs;
    }

    // inspiré de https://www.geeksforgeeks.org/print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n/
    combinationUtil(arr: string[], data: string[], start: number, end: number, index: number, r: number, stock: Set<string>) {
        let whiteCombDone = false;
        if (index === r) {
            const comb = [];
            for (let j = 0; j < r; j++) {
                comb.push(data[j]);
            }
            if (this.canBeWord(comb)) {
                const whiteLetters: number = comb.join('').split(WHITE_LETTER).length - 1;
                if (!whiteLetters) stock.add(comb.join(''));
                else if (whiteLetters && !whiteCombDone) {
                    const newCombs = this.getAllWordswithWhiteLetter(comb, whiteLetters);
                    newCombs.forEach((newComb) => stock.add(newComb.join('')));
                    whiteCombDone = true;
                }
            }
        }
        for (let i = start; i <= end && end - i + 1 >= r - index; i++) {
            data[index] = arr[i];
            this.combinationUtil(arr, data, i + 1, end, index + 1, r, stock);
        }
    }
    printCombination(arr: string[], n: number, r: number, stock: Set<string>) {
        const data = new Array(r);
        this.combinationUtil(arr, data, 0, n - 1, 0, r, stock);
    }

    // inspiré de https://stackoverflow.com/questions/9960908/permutations-in-javascript
    permutator(inputArr: string[]): string[] {
        const result = new Set<string>();

        const permute = (arr: string[], m: string[] = []) => {
            if (arr.length === 0) {
                result.add(m.join(''));
            } else {
                for (let i = 0; i < arr.length; i++) {
                    const curr: string[] = [...arr];
                    const next: string[] = curr.splice(i, 1);
                    permute(curr.slice(), m.concat(next));
                }
            }
        };
        permute(inputArr);
        return Array.from(result.values());
    }
    isTheSameWord(letters: Letter[], words: Set<Letter[]>): boolean {
        for (const word of words) {
            let sameLetters = 0;
            if (word.length !== letters.length) continue;
            word.forEach((letter, index) => {
                const letterWord = letters[index];
                if (letter.line === letterWord.line && letter.column === letterWord.column && letter.value === letterWord.value) {
                    sameLetters++;
                }
            });
            if (sameLetters === word.length) return true;
        }
        return false;
    }
    getRackPlayerCombinations(): Set<string> {
        const rack = this.rackPlayer.rackInString.split('');
        const n = rack.length;
        const whiteLetters: number = this.rackPlayer.rackInString.split(WHITE_LETTER).length - 1;
        const wordsLength = whiteLetters !== 0 && rack.length > 5 ? 5 : rack.length;
        this.numPlacementsVirtualPlayer = whiteLetters === 2 ? 1 : MAX_PLACEMENTS_VIRTUAL_PLAYER;
        this.numPlacementsVirtualPlayer = whiteLetters === 1 ? MAX_PLACEMENTS_VIRTUAL_PLAYER / 2 : MAX_PLACEMENTS_VIRTUAL_PLAYER;
        const combinaison: Set<string> = new Set();
        for (let i = wordsLength; i > 0; i--) {
            this.printCombination(rack, n, i, combinaison);
        }
        return combinaison;
    }
    getMostPointsPlacement(isFirstTurn: boolean): Placement {
        const rack = this.rackPlayer.rackInString.split('');
        const whiteLetters: number = this.rackPlayer.rackInString.split(WHITE_LETTER).length - 1;
        const n = whiteLetters !== 0 && rack.length > MAX_HINT_LENGTH ? MAX_HINT_LENGTH : rack.length;
        let placementFound = false;
        let placement: Placement = INVALID_PLACEMENT;
        for (let i = n; i > 0; i--) {
            const combinaison: Set<string> = new Set();
            this.printCombination(rack, n, i, combinaison);
            for (const lettersComb of combinaison) {
                placement = this.getCombMostPoint(isFirstTurn, lettersComb.split(''));
                if (placement.points !== 0) {
                    placementFound = true;
                    break;
                }
            }
            if (placementFound) break;
        }
        return placement;
    }
    getCombMostPoint(isFirstTurn: boolean, lettersComb: string[]): Placement {
        const allPermsComb: string[] = this.permutator(lettersComb);
        const word: Placement = this.getMostWordPoints(isFirstTurn, allPermsComb);
        return word;
    }
    // Valid placements and positions combinations
    getCombinationValidPositions(isFirstTurn: boolean, lettersPlacement: string, placementCommands: Set<string>): Placement[] {
        const placements: Placement[] = [];
        if (isFirstTurn) {
            const lettersPosition = this.board.findLettersPosition(HALF_INDEX_BOARD, HALF_INDEX_BOARD, lettersPlacement);
            const placementPoints = this.validationService.verifyAndCalculate(lettersPosition);
            if (placementPoints !== 0) {
                const placementToCommand: string = this.wordToCommand(lettersPosition);
                if (!placementCommands.has(placementToCommand)) {
                    placementCommands.add(placementToCommand);
                    placements.push({ letters: lettersPosition, points: placementPoints, command: placementToCommand });
                }
            }
            return placements;
        }
        for (let line = START_INDEX_BOARD; line < END_COLUMN_BOARD; line++) {
            for (let column = START_INDEX_BOARD; column < END_COLUMN_BOARD; column++) {
                for (const direction of DIRECTIONS) {
                    if (
                        !this.board.getBoxIndex(line, column).letter.value &&
                        this.board.areLettersAttachedAndNotOutside(line, column, lettersPlacement, direction)
                    ) {
                        const lettersPosition = this.board.findLettersPosition(line, column, lettersPlacement, direction);
                        const placementPoints = this.validationService.verifyAndCalculate(lettersPosition);
                        if (placementPoints !== 0) {
                            const placementToCommand: string = this.wordToCommand(lettersPosition);
                            if (!placementCommands.has(placementToCommand)) {
                                placementCommands.add(placementToCommand);
                                placements.push({ letters: lettersPosition, points: placementPoints, command: placementToCommand });
                            }
                        }
                    }
                }
            }
        }
        return placements;
    }
    getMostPointsHints(isFirstTurn: boolean, rackPermutations: string[], placementCommands: Set<string>): Placement[] {
        let bestPlacements: Placement[] = [];
        let rackCompPassed = 0;
        for (const rackComb of rackPermutations) {
            if (isFirstTurn && rackComb.length === 1) continue;
            const placements: Placement[] = this.getCombinationValidPositions(isFirstTurn, rackComb, placementCommands);
            bestPlacements = bestPlacements.concat(placements);
            // Si on trouve rien 20 fois de suite on arrete
            if (bestPlacements.length === 0) rackCompPassed++;
            if (bestPlacements.length === 10 || rackCompPassed === 20) break;
        }
        return bestPlacements.sort((a, b) => b.points - a.points).slice(0, MAX_FOUND_WORDS);
    }
    getBestHints(isFirstTurn: boolean): Placement[] {
        const combinaison: Set<string> = this.getRackPlayerCombinations();
        const placementsCommands: Set<string> = new Set();
        let bestPlacements: Placement[] = [];
        for (const lettersComb of combinaison) {
            const allPermsComb: string[] = this.permutator(lettersComb.split(''));
            const placements: Placement[] = this.getMostPointsHints(isFirstTurn, allPermsComb, placementsCommands);
            bestPlacements = bestPlacements.concat(placements);
            if (bestPlacements.length > MAX_FOUND_WORDS) break;
        }
        return bestPlacements.sort((a, b) => b.points - a.points).slice(0, MAX_FOUND_WORDS);
    }
    getAllWords(isFirstTurn: boolean): Set<Letter[]> {
        const combinaison: Set<string> = this.getRackPlayerCombinations();
        const validCombinations: Set<Letter[]> = new Set<Letter[]>();
        for (const lettersComb of combinaison) {
            const allPermsComb: string[] = this.permutator(lettersComb.split(''));
            const word: Letter[] | undefined = this.getValidWord(isFirstTurn, allPermsComb);
            if (word && !this.isTheSameWord(word, validCombinations)) validCombinations.add(word);
            if (validCombinations.size === MAX_FOUND_WORDS) break;
        }
        return validCombinations;
    }
    pointsScoreBetween(pointsScale: POINTS): PointVerification {
        let pointsVerification;
        switch (pointsScale) {
            case POINTS.SixOrLess:
                pointsVerification = (points: number) => points <= POINTS.SixOrLess;
                break;
            case POINTS.SevenToTwelve:
                pointsVerification = (points: number) => points > POINTS.SixOrLess && points <= POINTS.SevenToTwelve;
                break;
            case POINTS.ThirteenToEighteen:
                pointsVerification = (points: number) => points > POINTS.SevenToTwelve && points <= POINTS.ThirteenToEighteen;
                break;
        }
        return pointsVerification;
    }
    getAllWordsInPointsScale(isFirstTurn: boolean, pointsScale: POINTS): Placement[] {
        const pointsVerif: PointVerification = this.pointsScoreBetween(pointsScale);
        const combinaison: Set<string> = this.getRackPlayerCombinations();
        const validCombinations: Placement[] = [];
        for (const lettersComb of combinaison) {
            const allPermsComb: string[] = this.permutator(lettersComb.split(''));
            const word: Placement = this.getValidWordPoints(isFirstTurn, allPermsComb, pointsVerif);
            if (word.points && this.notSamePoints(word, validCombinations)) validCombinations.push(word);
            if (validCombinations.length === this.numPlacementsVirtualPlayer) break;
        }
        return validCombinations;
    }
    getCombinationPositions(isFirstTurn: boolean, lettersPlacement: string): Letter[][] {
        const positions: Letter[][] = [];
        if (isFirstTurn) return [this.board.findLettersPosition(HALF_INDEX_BOARD, HALF_INDEX_BOARD, lettersPlacement)];
        for (let line = START_INDEX_BOARD; line < END_COLUMN_BOARD; line++) {
            for (let column = START_INDEX_BOARD; column < END_COLUMN_BOARD; column++) {
                for (const direction of DIRECTIONS) {
                    if (
                        !this.board.getBoxIndex(line, column).letter.value &&
                        this.board.areLettersAttachedAndNotOutside(line, column, lettersPlacement, direction)
                    )
                        positions.push(this.board.findLettersPosition(line, column, lettersPlacement, direction));
                }
            }
        }
        return positions;
    }
    getValidWord(isFirstTurn: boolean, rackPermutations: string[]): Letter[] | undefined {
        for (const rackComb of rackPermutations) {
            if (isFirstTurn && rackComb.length === 1) continue;
            const positions: Letter[][] = this.getCombinationPositions(isFirstTurn, rackComb);
            for (const lettersPos of positions) {
                if (this.validationService.verifyAllWords(lettersPos)) {
                    return lettersPos;
                }
            }
        }
        return undefined;
    }
    getMostWordPoints(isFirstTurn: boolean, rackPermutations: string[]): Placement {
        const invalidLetter: Letter[] = [{ line: 0, column: 0, value: '' }];
        const placement = { letters: invalidLetter, points: 0, command: '' };
        let bestPoints = 0;
        for (const rackComb of rackPermutations) {
            if (isFirstTurn && rackComb.length === 1) continue;
            const positions: Letter[][] = this.getCombinationPositions(isFirstTurn, rackComb);
            for (const lettersPos of positions) {
                const placementPoints = this.validationService.verifyAndCalculate(lettersPos);
                if (placementPoints > bestPoints) {
                    bestPoints = placementPoints;
                    placement.letters = lettersPos;
                    placement.points = placementPoints;
                }
            }
        }
        return placement;
    }
    getValidWordPoints(isFirstTurn: boolean, rackPermutations: string[], pointVerif: PointVerification): Placement {
        for (const rackComb of rackPermutations) {
            if (isFirstTurn && rackComb.length === 1) continue;
            const positions: Letter[][] = this.getCombinationPositions(isFirstTurn, rackComb);
            for (const lettersPos of positions) {
                const placementPoints = this.validationService.verifyAndCalculate(lettersPos);
                if (placementPoints && pointVerif(placementPoints)) {
                    return { letters: lettersPos, points: placementPoints, command: '' };
                }
            }
        }
        return INVALID_PLACEMENT;
    }
    wordToCommand(word: Letter[]): string {
        const ASCII_LETTER = 97;
        const line = String.fromCharCode(word[0].line + ASCII_LETTER);
        const column = word[0].column + 1;
        let wordDirection = '';
        if (word.length !== 1) {
            wordDirection = word[0].line !== word[1].line ? VERTICAL : HORIZONTAL;
        }
        let placement = `!placer ${line}${column}${wordDirection} `;
        let letters = '';
        for (const letter of word) letters = letters + letter.value;
        placement = placement + letters;
        return placement;
    }
    hintPlacement(isFirstTurn: boolean): string {
        const placementPossibilties: string[] = [];
        const validCombinations: Set<Letter[]> = this.getAllWords(isFirstTurn);
        for (const word of validCombinations) {
            const placement: string = this.wordToCommand(word);
            placementPossibilties.push(placement);
        }
        if (placementPossibilties.length === 0) return "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !";
        const hintMessage: string = placementPossibilties.join('\n');
        if (placementPossibilties.length !== MAX_FOUND_WORDS) return 'Ces seuls placements ont été trouvés: \n' + hintMessage;
        return hintMessage;
    }
}
