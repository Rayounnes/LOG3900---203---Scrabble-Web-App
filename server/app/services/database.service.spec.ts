/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { DATABASE_NAME } from '@app/constants/constants';
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised); // this allows us to test for rejection
describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();

        // Start a local test server
        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal(DATABASE_NAME);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        // Try to reconnect to local server
        try {
            await databaseService.start('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).to.be.undefined;
        }
    });

    it('should no longer be connected if close is called', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
    });
    /*

    it('should populate the database with a helper function', async () => {
        const mongoUri = await mongoServer.getUri();
        const client = await MongoClient.connect(mongoUri);
        databaseService['db'] = client.db('database');
        await databaseService.populateDBScoresClassique();
        const scores = await databaseService.database.collection('DB_COLLECTION_CLASSIQUE').find({}).toArray();
        expect(scores.length).to.equal(0);
    });

    it('should not populate the database with start function if it is already populated for classic mode', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let courses = await databaseService.database.collection('DB_COLLECTION_CLASSIQUE').find({}).toArray();
        expect(courses.length).to.equal(0);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        courses = await databaseService.database.collection('DB_COLLECTION_CLASSIQUE').find({}).toArray();
        expect(courses.length).to.equal(0);
    });

    it('should not populate the database with start function if it is already populated for log2990 mode', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let courses = await databaseService.database.collection('DB_COLLECTION_LOG2990').find({}).toArray();
        expect(courses.length).to.equal(0);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        courses = await databaseService.database.collection('DB_COLLECTION_LOG2990').find({}).toArray();
        expect(courses.length).to.equal(0);
    });
    */

    it('should not populate the database with start function if it is already populated with game history', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let games = await databaseService.database.collection('DB_COLLECTION_GAME_HISTORY').find({}).toArray();
        expect(games.length).to.equal(0);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        games = await databaseService.database.collection('DB_COLLECTION_GAME_HISTORY').find({}).toArray();
        expect(games.length).to.equal(0);
    });
});
