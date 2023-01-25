import { Dictionary } from './dictionary';
export interface Game {
    isJoined: boolean;
    usernameOne: string;
    usernameTwo: string;
    time: number;
    dictionary: Dictionary;
    hostID: string;
    mode: string;
    type: string;
}
