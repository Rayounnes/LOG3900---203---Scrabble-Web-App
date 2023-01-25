/*eslint-disable */
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from './database.service.mock';
chai.use(chaiAsPromised);
chai.use(spies);
describe('Database mock service', () => {
    let databaseService: DatabaseServiceMock;

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('start should connect to the database when start is called', async () => {
        await databaseService.start();
        expect(databaseService['db'].databaseName).to.equal('database');
    });

    it('start should not connect to the database when client is already existent', async () => {
        await databaseService.start();
        databaseService.start().then(() => {
            expect(databaseService['client']).to.be.instanceOf(MongoClient);
        });
    });

    it('start should return dataBaseService.db', async () => {
        databaseService.start().then(() => {
            expect(databaseService.database).to.equal(databaseService['db']);
        });
    });

    it('closeConnection should close connection to the database if client is not already closed', async () => {
        await databaseService.start();
        databaseService.closeConnection().then(() => {
            expect(databaseService).to.be.undefined;
        });
    });

    it('closeConnection should resolve if client is already closed', async () => {
        databaseService.closeConnection().then(() => {
            expect(databaseService).to.be.undefined;
        });
    });
});
