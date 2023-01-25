export class Tile {
    color: string;
    line: number;
    column: number;
    isFilled: boolean;
    letter: string;
    isStart: boolean;
    direction: string;

    constructor(colorChosen: string, isFilledChosen: boolean, letterChosen: string) {
        this.color = colorChosen;
        this.isFilled = isFilledChosen;
        this.letter = letterChosen;
        this.isStart = false;
        this.direction = 'h';
    }
}
