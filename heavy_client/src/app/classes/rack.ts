import { RackTile } from './rack-tile';

const RACK_SIZE = 7;
export class Rack {
    rackArray: RackTile[] = [];
    readonly endRack = RACK_SIZE;
    constructor() {
        for (let i = 0; i < this.endRack; i++) {
            this.rackArray[i] = new RackTile();
        }
    }

    setLetter(letter: string, position: number) {
        this.rackArray[position].letter = letter;
    }

    getPosition(letter: string) {
        for (let i = 0; i < this.endRack; i++) {
            if (this.rackArray[i].letter === letter) {
                return i;
            }
        }
        return undefined;
    }
}
