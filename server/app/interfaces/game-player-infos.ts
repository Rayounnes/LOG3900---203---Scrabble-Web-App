export interface GamePlayerInfos {
    username: string;
    points: number;
    isVirtualPlayer: boolean;
    tilesLeft: number;
    tiles: string[];
    socket: string;
    isTurn?: boolean;
    icon?: string;
}
