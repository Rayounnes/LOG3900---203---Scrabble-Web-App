import { Game } from '@app/interfaces/game';
export interface SoloGame extends Game {
    virtualPlayerName: string;
    difficulty: string;
}
