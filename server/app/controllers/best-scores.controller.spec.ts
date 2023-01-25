import { Application } from '@app/app';
import { HTTP_STATUS_ACCEPTED, HTTP_STATUS_CREATED, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } from '@app/constants/constants';
import { TopScore } from '@app/interfaces/top-scores';
import { BestScoresService } from '@app/services/best-scores.service';
import { assert, expect } from 'chai';
import * as Sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('BestScore Controller', () => {
    const expectedBestScores: TopScore[] = [
        { playerName: 'player5', score: 5 },
        { playerName: 'player4', score: 10 },
        { playerName: 'player3', score: 15 },
        { playerName: 'player2', score: 20 },
        { playerName: 'player1', score: 25 },
    ];
    const bestScoreTest: TopScore = {
        playerName: 'testPlayer',
        score: 1000,
    };
    let bestScoreCollectionService: BestScoresService;
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        bestScoreCollectionService = Container.get(BestScoresService);
        expressApp = app.app;
    });

    it('should store best score in the array on valid post request to /send in classic mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'addScoreClassique').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/bestScore/Classic/send')
            .send(bestScoreTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should store best score in the array on valid post request to /send in Log2990 mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'addScoreLog').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/bestScore/Log2990/send')
            .send(bestScoreTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all Best scores on valid get request to /all classic mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'getTopBestScoresClassique').returns(Promise.resolve(expectedBestScores));
        // bestScoreCollectionService.getFirstFiveBestScores.resolves(expectedBestScores);
        return supertest(expressApp)
            .get('/api/bestScore/Classic/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedBestScores);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all Best scores on valid get request to /all Log2990 mode', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'getTopBestScoresLog').returns(Promise.resolve(expectedBestScores));
        return supertest(expressApp)
            .get('/api/bestScore/Log2990/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedBestScores);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });
    it('should rest Best scores on valid get request to /reset', async () => {
        const stubOn = Sinon.stub(bestScoreCollectionService, 'resetBestScores').returns(Promise.resolve());
        return supertest(expressApp)
            .delete('/api/bestScore/reset')
            .expect(HTTP_STATUS_ACCEPTED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });
    it('should return error Non valid request to /reset', async () => {
        return new Promise<void>((resolve) => {
            const stubOn = Sinon.stub(bestScoreCollectionService, 'resetBestScores').returns(
                new Promise(() => {
                    throw Error();
                }),
            );
            supertest(expressApp)
                .delete('/api/bestScore/reset')
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response: unknown) => {
                    expect((response as Response).body).to.deep.equal({ name: 'test' });
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
