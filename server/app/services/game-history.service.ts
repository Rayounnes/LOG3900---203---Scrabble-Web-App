import { GameHistory } from '@app/interfaces/game-historic-info';
import { DB_COLLECTION_GAME_HISTORY } from '@app/constants/constants';
import types from '@app/types';
import { inject, injectable } from 'inversify';
import { Collection } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@injectable()
@Service()
export class GameHistoryService {
    gameHistory: GameHistory[];

    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get collectionGameHistory(): Collection<GameHistory> {
        return this.databaseService.database.collection(DB_COLLECTION_GAME_HISTORY);
    }

    async getGameHistory(): Promise<GameHistory[]> {
        return await this.collectionGameHistory.find({}).toArray();
    }

    async addGameHistory(game: GameHistory): Promise<void> {
        await this.collectionGameHistory.insertOne(game);
    }

    async resetGameHistory(): Promise<void> {
        await this.collectionGameHistory.deleteMany({});
    }
}
