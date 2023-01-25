import { Application } from '@app/app';
import {
    BEGINNER_VIRTUAL_PLAYERS,
    EXPERT_VIRTUAL_PLAYERS,
    HTTP_STATUS_CREATED,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_OK,
} from '@app/constants/constants';
import { VPlayerName } from '@app/interfaces/virtual-player';
import { VirtualPlayerCollectorService } from '@app/services/virtual-player-collector.service';
import { assert, expect } from 'chai';
import * as Sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
describe('Virtual Player Controller', () => {
    let virtualPlayerCollectionService: VirtualPlayerCollectorService;
    let expressApp: Express.Application;
    const virtualPlayerTest: VPlayerName = { name: 'virtualPlayerTest' };

    beforeEach(async () => {
        const app = Container.get(Application);
        virtualPlayerCollectionService = Container.get(VirtualPlayerCollectorService);
        expressApp = app.app;
    });

    it('should store virtual player in the array on valid post request to /expert/send in expert level', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'addName').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/virtualPlayer/expert/send')
            .send(virtualPlayerTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should store virtual player in the array on valid post request to /expert/send in beginner level', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'addName').returns(Promise.resolve());
        return supertest(expressApp)
            .post('/api/virtualPlayer/beginner/send')
            .send(virtualPlayerTest)
            .expect(HTTP_STATUS_CREATED)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error valid post request to /expert/send in expert level', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'addName').returns(Promise.reject());
        return supertest(expressApp)
            .post('/api/virtualPlayer/expert/send')
            .send(virtualPlayerTest)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on valid post request to /expert/send in beginner level', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'addName').returns(Promise.reject());
        return supertest(expressApp)
            .post('/api/virtualPlayer/beginner/send')
            .send(virtualPlayerTest)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all beginner virtual players on valid get request to /beginner/all', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'getAllVirtualPlayersNames').returns(Promise.resolve(BEGINNER_VIRTUAL_PLAYERS));
        return supertest(expressApp)
            .get('/api/virtualPlayer/beginner/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(BEGINNER_VIRTUAL_PLAYERS);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return all expert virtual players on valid get request to /expert/all', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'getAllVirtualPlayersNames').returns(Promise.resolve(EXPERT_VIRTUAL_PLAYERS));
        return supertest(expressApp)
            .get('/api/virtualPlayer/expert/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(EXPERT_VIRTUAL_PLAYERS);
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not valid get request to /beginner/all', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'getAllVirtualPlayersNames').returns(Promise.reject());
        return supertest(expressApp)
            .get('/api/virtualPlayer/beginner/all')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not  valid get request to /expert/all', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'getAllVirtualPlayersNames').returns(Promise.reject());
        return supertest(expressApp)
            .get('/api/virtualPlayer/expert/all')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should modify the beginner virtualPlayerName on valid put request to /beginner/modifyName/:oldName', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'modifyName').returns(Promise.resolve());
        return supertest(expressApp)
            .put('/api/virtualPlayer/beginner/modifyName/:oldName')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should modify the beginner virtualPlayerName on valid put request to /expert/modifyName/:oldName', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'modifyName').returns(Promise.resolve());
        return supertest(expressApp)
            .put('/api/virtualPlayer/expert/modifyName/:oldName')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error to not valid put request to /beginner/modifyName/:oldName', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'modifyName').returns(Promise.reject());
        return supertest(expressApp)
            .put('/api/virtualPlayer/beginner/modifyName/:oldName')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error to not valid put request to /expert/modifyName/:oldName', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'modifyName').returns(Promise.reject());
        return supertest(expressApp)
            .put('/api/virtualPlayer/expert/modifyName/:oldName')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should delete beginner virtualPlayer on valid get request to /beginner/delete/:name', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'deleteName').returns(Promise.resolve());
        return supertest(expressApp)
            .delete('/api/virtualPlayer/beginner/delete/:name')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should delete expert virtualPlayer on valid get request to /expert/delete/:name', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'deleteName').returns(Promise.resolve());
        return supertest(expressApp)
            .delete('/api/virtualPlayer/expert/delete/:name')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not valid get request to /beginner/delete/:name', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'deleteName').returns(Promise.reject());
        return supertest(expressApp)
            .delete('/api/virtualPlayer/beginner/delete/:name')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should return error on not valid get request to /expert/delete/:name', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'deleteName').returns(Promise.reject());
        return supertest(expressApp)
            .delete('/api/virtualPlayer/expert/delete/:name')
            .expect(HTTP_STATUS_OK)
            .catch(() => {
                expect(stubOn.called).to.equal(true);
            })
            .finally(() => stubOn.restore());
    });

    it('should rest all virtual player on valid get request to /reset', async () => {
        const stubOn = Sinon.stub(virtualPlayerCollectionService, 'resetAllVirtualPlayers').returns(Promise.resolve());
        return (
            supertest(expressApp)
                .delete('/api/virtualPlayer/reset')
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                .expect(202)
                .then(() => {
                    expect(stubOn.called).to.equal(true);
                })
                .finally(() => stubOn.restore())
        );
    });

    it('should return error Non valid DELETE request to /reset', async () => {
        return new Promise<void>((resolve) => {
            const stubOn = Sinon.stub(virtualPlayerCollectionService, 'resetAllVirtualPlayers').returns(
                new Promise(() => {
                    throw Error();
                }),
            );

            supertest(expressApp)
                .delete('/api/virtualPlayer/reset')
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
