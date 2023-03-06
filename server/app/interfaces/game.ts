import { Dictionary } from './dictionary';
import { PlayerInfos } from './player-infos';
export interface Game {
    hostUsername: string;
    hostID: string;
    room: string;
    isClassicMode: boolean;
    isPrivate: boolean;
    playersWaiting: number; // joueurs qui attendent l'acceptation du hôte
    isFullPlayers: boolean;
    password: string;
    humanPlayers: number;
    joinedPlayers: PlayerInfos[]; // usernames
    observers: number;
    joinedObservers: PlayerInfos[]; // usernames
    virtualPlayers: number;
    time: number;
    dictionary: Dictionary;
}
