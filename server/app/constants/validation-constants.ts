import { Letter } from '@app/interfaces/lettre';
import { Word } from '@app/interfaces/word';
export const WORDS_CREATION_VERTICAL: Letter[] = [
    { value: 'd', line: 3, column: 5 },
    { value: 'e', line: 4, column: 5 },
    { value: 'r', line: 5, column: 5 },
    { value: 'o', line: 6, column: 5 },
    { value: 'b', line: 7, column: 5 },
    { value: 'e', line: 8, column: 5 },
    { value: 't', line: 5, column: 7 },
    { value: 'a', line: 6, column: 7 },
    { value: 'i', line: 6, column: 8 },
    { value: 't', line: 6, column: 9 },
    { value: 'c', line: 7, column: 7 },
];
export const CREATED_WORDS: Word[] = [
    { word: 'de', lineStart: 3, columnStart: 5, direction: 'h' },
    { word: 'et', lineStart: 4, columnStart: 5, direction: 'h' },
    { word: 'rit', lineStart: 5, columnStart: 5, direction: 'h' },
    { word: 'osait', lineStart: 6, columnStart: 5, direction: 'h' },
    { word: 'bec', lineStart: 7, columnStart: 5, direction: 'h' },
    { word: 'es', lineStart: 8, columnStart: 5, direction: 'h' },
];
export const WORDS_CREATION_HORIZONTAL: Letter[] = [
    { value: 'r', line: 7, column: 3 },
    { value: 'm', line: 9, column: 3 },
    { value: 'e', line: 10, column: 3 },
    { value: 'r', line: 11, column: 3 },
    { value: 'a', line: 5, column: 5 },
    { value: 'l', line: 6, column: 5 },
    { value: 'l', line: 7, column: 5 },
    { value: 'o', line: 9, column: 6 },
    { value: 'i', line: 10, column: 6 },
    { value: 'r', line: 11, column: 6 },
    { value: 'g', line: 4, column: 8 },
    { value: 'a', line: 5, column: 8 },
    { value: 'r', line: 6, column: 8 },
    { value: 'e', line: 7, column: 8 },
];
