import {
    BEGINNER_VIRTUAL_PLAYERS,
    BEGINNER_VIRTUAL_PLAYERS_NAMES,
    EXPERT_VIRTUAL_PLAYERS,
    EXPERT_VIRTUAL_PLAYERS_NAMES,
    VPlayerLevel,
} from '@app/constants/constants';
import { VPlayerName } from '@app/interfaces/virtual-player';
import types from '@app/types';
import { inject } from 'inversify';
import { Collection } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

export const VPLAYER_COLLECTION = 'VPLAYERS';

@Service()
export class VirtualPlayerCollectorService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    collection(level: VPlayerLevel): Collection<VPlayerName> {
        return this.databaseService.database.collection(level + VPLAYER_COLLECTION);
    }

    async getAllVirtualPlayersNames(level: VPlayerLevel): Promise<VPlayerName[]> {
        return await this.collection(level).find({}).toArray();
    }

    async modifyName(oldname: string, virtualPlayer: VPlayerName, level: VPlayerLevel): Promise<void> {
        if (this.validateVirtualPlayerName(virtualPlayer.name)) {
            await this.collection(level).findOneAndReplace({ name: oldname }, virtualPlayer);
        }
    }

    async addName(virtualPlayer: VPlayerName, level: VPlayerLevel): Promise<void> {
        if (this.validateVirtualPlayerName(virtualPlayer.name)) {
            this.collection(level).insertOne({ name: virtualPlayer.name });
        }
    }

    async deleteName(nameToDelete: string, level: VPlayerLevel): Promise<void> {
        const nameExistsInList = BEGINNER_VIRTUAL_PLAYERS_NAMES.includes(nameToDelete, 0) || EXPERT_VIRTUAL_PLAYERS_NAMES.includes(nameToDelete, 0);
        if (!nameExistsInList) {
            this.collection(level).deleteOne({ name: nameToDelete });
        }
    }

    async deleteAllVirtualPlayers(level: VPlayerLevel): Promise<void> {
        this.collection(level).deleteMany({});
    }

    async insertResetVirtualPlayers(level: VPlayerLevel, names: VPlayerName[]): Promise<void> {
        for (const name of names) this.collection(level).insertOne(name);
    }

    async resetAllVirtualPlayers() {
        await this.deleteAllVirtualPlayers(VPlayerLevel.Beginner);
        await this.deleteAllVirtualPlayers(VPlayerLevel.Expert);
        await this.insertResetVirtualPlayers(VPlayerLevel.Beginner, BEGINNER_VIRTUAL_PLAYERS);
        await this.insertResetVirtualPlayers(VPlayerLevel.Expert, EXPERT_VIRTUAL_PLAYERS);
    }

    validateVirtualPlayerName(name: string): boolean {
        name = name.replace(/\s/g, '');
        return !!name.length;
    }
}
