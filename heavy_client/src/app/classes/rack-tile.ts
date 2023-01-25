export class RackTile {
    letter: string;
    selection: string;
    isOut?: boolean = false;

    constructor(letterChosen: string = '', selectionChosen: string = '', isOutChosen: boolean = false) {
        this.letter = letterChosen;
        this.selection = selectionChosen;
        this.isOut = isOutChosen;
    }
}
