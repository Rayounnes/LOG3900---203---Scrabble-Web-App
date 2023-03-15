import { Vec2 } from "@app/interfaces/vec2";

export class TilePlacement {
    letter: string;
    position: Vec2;


    constructor(letterChosen: string, positionTile: Vec2) {
        this.position = positionTile;
        this.letter = letterChosen;
      
    }
}
