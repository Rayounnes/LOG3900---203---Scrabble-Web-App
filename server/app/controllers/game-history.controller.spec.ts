/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Application } from '@app/app';
import { HTTP_STATUS_CREATED, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } from '@app/constants/constants';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { GameHistoryService } from '@app/services/game-history.service';
import { assert, expect } from 'chai';
import * as Sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameHistoryController', () => {
    const expectedGameHistory: GameHistory[] = [
        {
            playerName: 'Nabil',
            opponentPlayerName: 'Marc',
            mode: 'Classique',
            date: '30/03/2022, 13:12:11',
            finalScore: 100,
            oponnentFinalScore: 50,
            duration: '20min 15sec',
            abandoned: '',
        },
    ];
    const gameHistoryTest: GameHistory[] = [
        {
            playerName: 'Nabz',
            opponentPlayerName: 'Jean',
            mode: 'Classique',
            date: '30/03/2022, 14:30:19',
            finalScore: 200,
            oponnentFinalScore: 150,
            duration: '30min 25sec',
            abandoned: '',
        },
    ];
    let gameHistoryCollectionService: GameHistoryService;
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        gameHistoryCollectionService = Container.get(GameHistoryService);
        expressApp = app.app;
    });

    it('should return all game history on valid get request to /all', async () => {
        const stubOn = Sinon.stub(gameHistoryCollectionService, 'getGameHistory').returns(Promise.resolve(expectedGameHistory));
        return supertest(expressApp)
            .get('/api/gameHistory/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedGameHistory);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should store game history in the array on valid post request to /send', async () => {
        const stubOn = Sinon.stub(gameHistoryCollectionService, 'addGameHistory').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/gameHistory/send')
            .send(gameHistoryTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });
    it('should reset game history on valid get request to /reset', async () => {
        const stubOn = Sinon.stub(gameHistoryCollectionService, 'resetGameHistory').returns(Promise.resolve());
        return supertest(expressApp)
            .delete('/api/gameHistory/reset')
            .expect(202)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });
    it('should return error Non valid request to /reset', async () => {
        return new Promise<void>((resolve) => {
            const stubOn = Sinon.stub(gameHistoryCollectionService, 'resetGameHistory').returns(
                new Promise(() => {
                    throw Error();
                }),
            );
            supertest(expressApp)
                .delete('/api/bestScore/reset')
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response: unknown) => {
                    expect((response as Response).body).to.deep.equal({ gameHistoryTest });
                    // expect(stubOn.called).to.equal(true);
                    resolve();
                })
                .catch((err) => {
                    expect(HTTP_STATUS_NOT_FOUND);
                    assert.isDefined(err);
                    resolve();
                })
                .finally(() => stubOn.restore());
        });
    });
});
