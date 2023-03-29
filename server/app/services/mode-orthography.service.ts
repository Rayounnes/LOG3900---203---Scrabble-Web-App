import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_WORDS, DB_COLLECTION_SCORESORTHOGRAPHY} from '@app/constants/constants';

@injectable()
@Service()
export class ModeOrthography {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get wordsOrthographyCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_WORDS);
    }

    get scoresOrthographyCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_SCORESORTHOGRAPHY);
    }

    async getAllWords() {
        const allWords = await this.wordsOrthographyCollection.find().toArray();
        const wordsList = allWords.map(word => word.words);
        return wordsList;
    }

    async getAllBestScore() {
        const bestScores = await this.scoresOrthographyCollection.find().toArray();
        return bestScores;
    }

    async getBestScore(username: string) {
        const document = await this.scoresOrthographyCollection.findOne({ name: username });
        if (document) {
            return document['score'];
        }
        return null;

    }

    async sendScore(score: number, username: string) {
        const scoreDoc = await this.scoresOrthographyCollection.findOne({ name: username });
        if (!scoreDoc || score > scoreDoc.score) {
            await this.scoresOrthographyCollection.updateOne(
                { name: username },
                { $set: { score: score }},
                { upsert: true }
            );
        }
    }
}
