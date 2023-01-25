import {
    DB_COLLECTION_CLASSIQUE,
    DB_COLLECTION_LOG2990,
    DESCENDING_ORDER,
    SCORES_CLASSIC,
    SCORES_LOG,
    TOP_FIVE_SCORES,
} from '@app/constants/constants';
import { TopScore } from '@app/interfaces/top-scores';
import types from '@app/types';
import { inject, injectable } from 'inversify';
import { Collection } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@injectable()
@Service()
export class BestScoresService {
    scoreClassique: TopScore[];
    scoreLOG2990: TopScore[];

    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get collectionClassique(): Collection<TopScore> {
        return this.databaseService.database.collection(DB_COLLECTION_CLASSIQUE);
    }

    get collectionLOG2990(): Collection<TopScore> {
        return this.databaseService.database.collection(DB_COLLECTION_LOG2990);
    }

    async getTopBestScoresClassique(): Promise<TopScore[]> {
        return await this.collectionClassique.find({}).sort({ score: DESCENDING_ORDER }).limit(TOP_FIVE_SCORES).toArray();
    }

    async getTopBestScoresLog(): Promise<TopScore[]> {
        return await this.collectionLOG2990.find({}).sort({ score: DESCENDING_ORDER }).limit(TOP_FIVE_SCORES).toArray();
    }

    async addScoreClassique(score: TopScore): Promise<void> {
        await this.collectionClassique.insertOne(score);
    }

    async addScoreLog(score: TopScore): Promise<void> {
        await this.collectionLOG2990.insertOne(score);
    }
    async insertResetScoreClassic(scores: TopScore[]): Promise<void> {
        for (const score of scores) this.collectionClassique.insertOne(score);
    }
    async insertResetScoreLog(scores: TopScore[]): Promise<void> {
        for (const score of scores) this.collectionLOG2990.insertOne(score);
    }
    async resetBestScores(): Promise<void> {
        await this.collectionClassique.deleteMany({});
        await this.collectionLOG2990.deleteMany({});
        await this.insertResetScoreLog(SCORES_LOG);
        await this.insertResetScoreClassic(SCORES_CLASSIC);
    }
}
