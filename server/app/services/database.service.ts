import { DATABASE_NAME, DATABASE_URL } from '@app/constants/constants';
import { TopScore } from '@app/interfaces/top-scores';
import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@injectable()
@Service()
export class DatabaseService {
    score: TopScore[];
    private db: Db;
    private client: MongoClient;

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
        return this.client;
    }
    async closeConnection(): Promise<void> {
        return this.client.close();
    }
    get database(): Db {
        return this.db;
    }
}
