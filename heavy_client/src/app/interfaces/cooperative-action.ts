import { Placement } from './placement';

export interface CooperativeAction {
    action: string;
    placement?: Placement;
    lettersToExchange?: string;
    socketId: string;
    votesFor: number;
    votesAgainst: number;
    socketAndChoice: any;
}
