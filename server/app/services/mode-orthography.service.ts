import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_WORDS } from '@app/constants/constants';

@injectable()
@Service()
export class ModeOrthography {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get wordsOrthographyCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_WORDS);
    }

    async getAllWords() {
        const allWords = await this.wordsOrthographyCollection.find().toArray();
        const wordsList = allWords.map(word => word.words);
        console.log(wordsList);
        return wordsList;
    }
}
