import { Letter } from '@app/interfaces/lettre';

export class Tile {
    multiplicatorUsed: boolean = false;
    letterMultiplicator: number;
    wordMultiplicator: number;
    letter: Letter = { value: '', line: 0, column: 0 };
    constructor(letterMultiplicator: number = 1, wordMultiplicator: number = 1) {
        this.letterMultiplicator = letterMultiplicator;
        this.wordMultiplicator = wordMultiplicator;
    }
}
