export interface GamePlayerInfos {
    username: string;
    points: number;
    isVirtualPlayer: boolean;
    tiles: number;
    socket : string;
    isTurn? : boolean;
    icon? : string
}