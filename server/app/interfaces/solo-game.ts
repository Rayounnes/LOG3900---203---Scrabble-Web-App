import { Game } from './game';
export interface SoloGame extends Game {
    virtualPlayerName: string;
    difficulty: string;
    isFinished: boolean;
}
