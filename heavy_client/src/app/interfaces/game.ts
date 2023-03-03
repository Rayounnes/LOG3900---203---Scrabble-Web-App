import { Dictionary } from './dictionary';
export interface Game {
    hostUsername: string;
    hostID: string;
    room: string;
    isClassicMode: boolean;
    isPrivate: boolean;
    isFullPlayers: boolean;
    password: string;
    humanPlayers: number;
    joinedPlayers: string[]; // usernames
    observers: number;
    joinedObservers: string[]; // usernames
    virtualPlayers: number;
    time: number;
    dictionary: Dictionary;
}
