/*eslint-disable */
import { GameHistory } from '@app/interfaces/game-historic-info';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from './database.service.mock';
import { GameHistoryService } from './game-history.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('GameHistoryCollectionService', () => {
    let client: MongoClient;
    let gameHistoryService: GameHistoryService;
    let databaseService: DatabaseServiceMock;

    const testGameHistory: GameHistory = {
        duration: '30min 20sec',
        playerName: 'Nabil',
        finalScore: 200,
        opponentPlayerName: 'Marc',
        oponnentFinalScore: 150,
        mode: 'Classique',
        date: '11/04/2022, 22:12:11',
        abandoned: '',
    };
    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        gameHistoryService = new GameHistoryService(databaseService as any);
        client = (await databaseService.start()) as MongoClient;

        gameHistoryService = new GameHistoryService(databaseService as any);

        await gameHistoryService.collectionGameHistory.insertOne(testGameHistory);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('getGameHistory should get all games that have been played from database', async () => {
        const gameHisory = await gameHistoryService.getGameHistory();
        expect(gameHisory.length).to.equal(1);
    });

    it('addGameHistory should insert a new game in the database', async () => {
        const gameToAdd: GameHistory = {
            duration: '44min 23sec',
            playerName: 'Nab',
            finalScore: 250,
            opponentPlayerName: 'Jean',
            oponnentFinalScore: 100,
            mode: 'Classique',
            date: '11/04/2022, 00:12:11',
            abandoned: '',
        };
        await gameHistoryService.addGameHistory(gameToAdd);
        const gameHistory = await gameHistoryService.getGameHistory();
        expect(gameHistory.length).to.equal(2);

        expect(gameHistory.find((x) => x.playerName === gameToAdd.playerName)).to.deep.equals(gameToAdd);
    });

    // Error handling
    describe('Error handling', async () => {
        it('should throw an error if we try to get all courses on a closed connection', async () => {
            await client.close();
            expect(gameHistoryService.getGameHistory()).to.eventually.be.rejectedWith(Error);
        });
    });
    it('resetGameHistory should reset GameHistory data ', async () => {
        chai.spy.on(gameHistoryService, 'resetGameHistory');
        await gameHistoryService.resetGameHistory();
        expect(gameHistoryService.resetGameHistory).to.have.been.called;
    });
});
