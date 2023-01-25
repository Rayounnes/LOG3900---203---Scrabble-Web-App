/*eslint-disable */
import { TopScore } from '@app/interfaces/top-scores';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { BestScoresService } from './best-scores.service';
import { DatabaseServiceMock } from './database.service.mock';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('BestScoreCollection Service', () => {
    let client: MongoClient;
    let bestScoreCollectionService: BestScoresService;
    let databaseService: DatabaseServiceMock;
    const testBestScoreClassicInfo: TopScore = {
        playerName: 'PlayerTestClassic',
        score: 100,
    };

    const testBestScoreLogInfo: TopScore = {
        playerName: 'PlayerTestLog',
        score: 100,
    };

    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        bestScoreCollectionService = new BestScoresService(databaseService as any);
        client = (await databaseService.start()) as MongoClient;

        bestScoreCollectionService = new BestScoresService(databaseService as any);

        await bestScoreCollectionService.collectionClassique.insertOne(testBestScoreClassicInfo);
        await bestScoreCollectionService.collectionLOG2990.insertOne(testBestScoreLogInfo);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('getAllScoresClassic should get all Best Scores from DB for Classic mode', async () => {
        let classicBestScores = await bestScoreCollectionService.getTopBestScoresClassique();
        expect(classicBestScores.length).to.equal(1);
    });

    it('getAllScoresLog should get all Best Scores from DB for Log2990 mode', async () => {
        let logBestScores = await bestScoreCollectionService.getTopBestScoresLog();
        expect(logBestScores.length).to.equal(1);
    });

    it('addScoreClassique should insert a new score in classic mode', async () => {
        let secondTestBestScoreClassic: TopScore = {
            playerName: 'PlayerTestClassicTwo',
            score: 200,
        };
        await bestScoreCollectionService.addScoreClassique(secondTestBestScoreClassic);
        let classicBestScores = await bestScoreCollectionService.collectionClassique.find({}).toArray();
        expect(classicBestScores.length).to.equal(2);

        expect(classicBestScores.find((x) => x.playerName === secondTestBestScoreClassic.playerName)).to.deep.equals(secondTestBestScoreClassic);
    });

    it('addScoreLog should insert a new score in log2990 mode', async () => {
        let secondTestBestScoreLog: TopScore = {
            playerName: 'PlayerTestLogTwo',
            score: 200,
        };
        await bestScoreCollectionService.addScoreLog(secondTestBestScoreLog);
        let logBestScores = await bestScoreCollectionService.collectionLOG2990.find({}).toArray();
        expect(logBestScores.length).to.equal(2);

        expect(logBestScores.find((x) => x.playerName === secondTestBestScoreLog.playerName)).to.deep.equals(secondTestBestScoreLog);
    });

    // Error handling
    describe('Error handling', async () => {
        it('should throw an error if we try to get all courses on a closed connection', async () => {
            await client.close();
            expect(bestScoreCollectionService.getTopBestScoresClassique()).to.eventually.be.rejectedWith(Error);
            expect(bestScoreCollectionService.getTopBestScoresLog()).to.eventually.be.rejectedWith(Error);
        });
    });

    it('resetBestScores should reset BestScores data ', async () => {
        chai.spy.on(bestScoreCollectionService, 'resetBestScores');
        await bestScoreCollectionService.resetBestScores();
        expect(bestScoreCollectionService.resetBestScores).to.have.been.called;
    });
});
