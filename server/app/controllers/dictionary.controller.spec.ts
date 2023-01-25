/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Application } from '@app/app';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryManager } from '@app/services/dictionary.service';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_OK = StatusCodes.OK;
// const HTTP_STATUS_CREATED = StatusCodes.CREATED;

describe('DictionaryController', () => {
    const dictList = {
        title: 'titre unique',
        description: 'description',
        words: ['lettre', 'mot', 'another'],
    } as Dictionary;
    let dictionaryService: DictionaryManager;
    let expressApp: Express.Application;

    beforeEach(async () => {
        const app = Container.get(Application);
        dictionaryService = Container.get(DictionaryManager);
        expressApp = app.app;
    });

    it('should get all dictionaries', async () => {
        const stub = sinon.stub(dictionaryService, 'getAllDictionaries').returns([dictList]);
        return supertest(expressApp)
            .get('/api/dictionary/all')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal([dictList]);
            })
            .finally(() => stub.restore());
    });

    it('should get dictionaries by title', async () => {
        const stub = sinon.stub(dictionaryService, 'getDictionary').returns(dictList);
        return supertest(expressApp)
            .get('/api/dictionary/title/dictionnaire.json')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(dictList);
            })
            .finally(() => stub.restore());
    });

    it('Dictionary by title should return 500 if a file name is not passed in the parameter', async () => {
        return supertest(expressApp).get('/api/dictionary/title/notAFile').expect(500);
    });

    it('should delete dictionary by fileName', async () => {
        const stub = sinon.stub(dictionaryService, 'deleteDictionary').callsFake(() => {});
        return supertest(expressApp)
            .delete('/api/dictionary/title/dictionnaire.json')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                assert(stub.called);
            })
            .finally(() => stub.restore());
    });

    it('deleteByFileName should return 500 if a file name is not passed in the parameter', async () => {
        return supertest(expressApp).delete('/api/dictionary/title/notAFile').expect(500);
    });

    it('Edit dictionary should call edit dictionary', async () => {
        const stub = sinon.stub(dictionaryService, 'editDictionary').callsFake(() => {});
        return supertest(expressApp)
            .put('/api/dictionary/file/dictionnary.json')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                assert(stub.called);
            })
            .finally(() => stub.restore());
    });

    it('should update dictionary by file name', async () => {
        return supertest(expressApp).put('/api/dictionary/file/notFileName').expect(500);
    });

    it('should reset all dictionaries', async () => {
        const stub = sinon.stub(dictionaryService, 'resetDictionaries').callsFake(() => {});
        return supertest(expressApp)
            .delete('/api/dictionary/reset')
            .expect(HTTP_STATUS_OK)
            .then(() => {
                assert(stub.called);
            })
            .finally(() => stub.restore());
    });

    // it.only('should return message from example service on valid get request to about route', async () => {
    //     const stub = sinon.stub(dictionaryService, 'resetDictionaries').throws(() => {
    //         return new Error();
    //     });
    //     return supertest(expressApp)
    //         .put('/api/dictionary/reset')
    //         .expect(500)
    //         .then(() => {
    //             assert(stub.called);
    //         })
    //         .finally(() => stub.restore());
    // });

    it('should be able to post a dictionary if its valid', async () => {
        const stub = sinon.stub(dictionaryService, 'isDictionaryValid').returns(true);
        const stubUpload = sinon.stub(dictionaryService, 'uploadFile').callsFake(() => {});
        return supertest(expressApp)
            .post('/api/dictionary/send')
            .send({ files: {} })
            .expect(200)
            .then(() => {
                assert(stubUpload.called);
            })
            .finally(() => {
                stub.restore();
                stubUpload.restore();
            });
    });

    it('should not be able to post a dictionary if its not valid', async () => {
        const stub = sinon.stub(dictionaryService, 'isDictionaryValid').returns(false);
        const stubUpload = sinon.stub(dictionaryService, 'uploadFile').callsFake(() => {});
        return supertest(expressApp)
            .post('/api/dictionary/send')
            .send({ files: { fileKey: {} } })
            .expect(406)
            .then(() => {
                assert(stubUpload.notCalled);
            })
            .finally(() => {
                stub.restore();
                stubUpload.restore();
            });
    });
});
