import { Dictionary } from '@app/interfaces/dictionary';
export interface Game {
    room: string;
    isJoined: boolean;
    usernameOne: string;
    usernameTwo: string;
    time: number;
    dictionary: Dictionary;
    hostID: string;
    mode: string;
    type: string;
}
