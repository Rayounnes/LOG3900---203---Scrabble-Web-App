export const VIRTUAL_PLAYERS_BEGGINERS = [{ name: 'Marc' }, { name: 'Ben' }, { name: 'Jean' }];
export const VIRTUAL_PLAYERS_EXPERTS = [{ name: 'Ronaldo' }, { name: 'Messi' }, { name: 'Mahrez' }];
export const BEGGINERS_NAMES = ['Marc', 'Ben', 'Jean'];
export const EXPERTS_NAMES = ['Ronaldo', 'Messi', 'Mahrez'];

export enum VPlayerLevel {
    Expert = 'expert',
    Beginner = 'beginner',
}

export interface VPlayerName {
    name: string;
}
