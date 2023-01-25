/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { VPlayerLevel } from '@app/constants/constants';
import { VPlayerName } from '@app/interfaces/virtual-player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from './database.service.mock';
import { VirtualPlayerCollectorService } from './virtual-player-collector.service';

chai.use(chaiAsPromised); // this allows us to test for rejection

describe('VirtualPlayerCollection Service', () => {
    let client: MongoClient;
    let virtualPlayersCollectionService: VirtualPlayerCollectorService;
    let databaseService: DatabaseServiceMock;
    const testVirtualPlayer: VPlayerName = {
        name: 'test',
    };
    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        virtualPlayersCollectionService = new VirtualPlayerCollectorService(databaseService as any);

        client = (await databaseService.start()) as MongoClient;
        virtualPlayersCollectionService = new VirtualPlayerCollectorService(databaseService as any);
        await virtualPlayersCollectionService.collection(VPlayerLevel.Beginner).insertOne(testVirtualPlayer);
        await virtualPlayersCollectionService.collection(VPlayerLevel.Expert).insertOne(testVirtualPlayer);
    });

    afterEach(async () => {
        await virtualPlayersCollectionService.deleteAllVirtualPlayers(VPlayerLevel.Beginner);
        await virtualPlayersCollectionService.deleteAllVirtualPlayers(VPlayerLevel.Expert);
        await client.close();
    });

    it('getAllVirtualPlayersNames should get all virtual players beginners names', async () => {
        const virtualPlayers = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(virtualPlayers[0]).to.deep.equals(testVirtualPlayer);
    });

    it('addName should insert a new beginner virtual player if virtual player name valid ', async () => {
        chai.spy.on(virtualPlayersCollectionService, 'validateVirtualPlayerName');
        const testVirtualPlayer1 = { name: 'test1bot' };
        await virtualPlayersCollectionService.addName(testVirtualPlayer1, VPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayersCollectionService.validateVirtualPlayerName).to.have.been.called;
        expect(virtualPlayerNames.length).to.deep.equals(2);
    });

    it('addName should not insert a new beginner virtual player if virtual player name not valid', async () => {
        const testVirtualPlayer1 = { name: '  ' };
        await virtualPlayersCollectionService.addName(testVirtualPlayer1, VPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).to.deep.equals(1);
    });

    it('modifyName should modify a beginner virtual player ', async () => {
        const testVirtualPlayer1 = { name: 'test1bot' };
        await virtualPlayersCollectionService.modifyName(testVirtualPlayer.name, testVirtualPlayer1, VPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayerNames[0].name).to.deep.equals(testVirtualPlayer1.name);
    });

    it('getAllVirtualPlayersNames should delete a beginner virtual player if does not exists in default virtual players ', async () => {
        await virtualPlayersCollectionService.deleteName(testVirtualPlayer.name, VPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).not.to.be.undefined;
    });
    it('deleteName should not delete a default beginner virtual player if exists in default virtual players ', async () => {
        await virtualPlayersCollectionService.resetAllVirtualPlayers();
        await virtualPlayersCollectionService.deleteName('bot1', VPlayerLevel.Beginner);
        const virtualPlayerNames = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayerNames.length).to.deep.equals(3);
    });

    it('resetAllVirtualPlayersNames should reset virtualPlayercollections data ', async () => {
        chai.spy.on(virtualPlayersCollectionService, 'deleteAllVirtualPlayers');
        chai.spy.on(virtualPlayersCollectionService, 'insertResetVirtualPlayers');
        await virtualPlayersCollectionService.resetAllVirtualPlayers();
        const virtualPlayersFind = await virtualPlayersCollectionService.getAllVirtualPlayersNames(VPlayerLevel.Beginner);
        expect(virtualPlayersFind.length).to.not.equal(0);
        expect(virtualPlayersCollectionService.deleteAllVirtualPlayers).to.have.been.called;
        expect(virtualPlayersCollectionService.insertResetVirtualPlayers).to.have.been.called;
    });
});
