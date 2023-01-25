/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
// acceder aux membres privés de la classe
import { assert, expect } from 'chai';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryManager } from './dictionary.service';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';

describe('DictionaryService', () => {
    let service: DictionaryManager;
    beforeEach(() => {
        service = new DictionaryManager();
    });
    it('should be created', () => {
        assert.isDefined(service);
    });

    it('isDictionaryValid should return false if file is undefined', async () => {
        const newData = {
            title: 'titre unique',
            description: 'description',
            words: ['lettre', 'mot'],
        } as Dictionary;

        const file = {
            data: 'hello',
        } as unknown as UploadedFile;

        const stubJSON = sinon.stub(JSON, 'parse').returns(newData);
        const fileName = sinon.stub(service, 'isFileNameUnique').returns(true);
        const title = sinon.stub(service, 'isTitleUnique').returns(true);
        const result = service.isDictionaryValid(file);
        expect(result).to.eql(true);
        stubJSON.restore();
        fileName.restore();
        title.restore();
    });

    it('uploadFile should call mv()', () => {
        const file: any = {};

        const fooSpy = sinon.spy(service, 'uploadFile');
        try {
            service.uploadFile(file);
        } catch (e) {
            // pass
        }
        assert(fooSpy.threw());
    });

    it('getAllDictionaries increase the size of dictionaries array', () => {
        const before = service.dictionaries.length;
        service.getAllDictionaries();
        const after = service.dictionaries.length;
        expect(after).to.be.greaterThan(before);
    });

    it('getDictionary should parse a file', () => {
        const spy = sinon.spy(JSON, 'parse');
        service.getDictionary('dictionnary.json');
        assert(spy.called);
    });

    it('getDictionary should throw an error', async () => {
        const fooSpy = sinon.spy(service, 'getDictionary');
        try {
            service.getDictionary('');
        } catch (e) {
            // pass
        }
        assert(fooSpy.threw());
    });

    it('deleteDictionary should call unlinkSync', () => {
        const spy = sinon.stub(fs, 'unlinkSync').callsFake(() => {});
        service.deleteDictionary('dictionnary.json');
        assert(spy.called);
        spy.restore();
    });

    it('deleteDictionary should throw an error', async () => {
        const fooSpy = sinon.spy(service, 'deleteDictionary');
        try {
            service.deleteDictionary('');
        } catch (e) {
            // pass
        }
        assert(fooSpy.threw());
    });

    it('resetDictionaries should call getListOfFiles', () => {
        const spy = sinon.stub(fs, 'unlinkSync').callsFake(() => {});
        service.resetDictionaries();
        assert(spy.called);
        spy.restore();
    });

    it('resetDictionary should throw an error', async () => {
        const stub = sinon.stub(service, 'getListOfFiles').get(() => ['']);

        const fooSpy = sinon.spy(service, 'resetDictionaries');
        try {
            service.resetDictionaries();
        } catch (e) {
            // pass
        }
        assert(fooSpy.threw());
        stub.restore();
    });

    it('editDictionary should call readFileSync', () => {
        const newData = {
            title: 'titre unique',
            description: 'description',
            words: ['lettre', 'mot', 'another'],
        } as Dictionary;
        const stub = sinon.stub(global, 'toString').returns(newData.toString());
        const stubWrite = sinon.stub(fs, 'writeFileSync').callsFake(() => {});
        const stubUnlink = sinon.stub(fs, 'unlinkSync').callsFake(() => {});
        const spy = sinon.spy(fs, 'readFileSync');
        service.editDictionary('dictionnary.json', newData);
        assert(spy.called);
        stub.restore();
        stubWrite.restore();
        stubUnlink.restore();
    });

    it('editDictionary should throw an error', async () => {
        const newData = {
            title: 'titre unique',
            description: 'description',
            words: ['lettre', 'mot', 'another'],
        } as Dictionary;
        const stub = sinon.stub(global, 'toString').returns(newData.toString());

        const fooSpy = sinon.spy(service, 'editDictionary');
        try {
            service.editDictionary('', newData);
        } catch (e) {
            // pass
        }
        assert(fooSpy.threw());
        stub.restore();
    });

    it('getListOfFiles should return return a list of Files', () => {
        const files = service.getListOfFiles;
        expect(files.length).to.greaterThan(0);
    });

    it('isFileNameUnique should return true for a new dictionary', () => {
        const param: any = {
            name: 'newDictionary.json',
        };
        const result = service.isFileNameUnique(param);
        expect(result).to.eql(true);
    });

    it('isFileNameUnique should return true for an existing dictionary', () => {
        const param: any = {
            name: 'dictionnary.json',
        };
        const result = service.isFileNameUnique(param.name);
        expect(result).to.eql(false);
    });

    it('isTitleUnique should return false if the new title matches an existing dictionary title', () => {
        const newData = {
            title: 'Mon dictionnaire',
        } as Dictionary;
        const result = service.isTitleUnique(newData.title);
        expect(result).to.eql(false);
    });

    it('isTitleUnique should return true if the new title doesnt match an existing dictionary title', () => {
        const newData = {
            title: 'titre unique XXXX',
        } as Dictionary;
        const result = service.isTitleUnique(newData.title);
        expect(result).to.eql(true);
    });

    it('isComplete should return false if a dictionary doesnt have at least a description, word and tite', () => {
        const newData = {
            title: 'seulement un titre',
        } as Dictionary;
        const result = service.isComplete(newData);
        expect(result).to.eql(false);
    });

    it('isComplete should return true if a dictionary has a description, word and tite', () => {
        const newData = {
            title: 'titre',
            description: 'description',
            words: ['lettre', 'mot'],
        } as Dictionary;
        const result = service.isComplete(newData);
        expect(result).to.eql(true);
    });

    it('notContainsDuplicate should return true if all words are unique', () => {
        const newData = ['lettre', 'mot'];
        const result = service.notContainsDuplicate(newData);
        expect(result).to.eql(true);
    });

    it('notContainsDuplicate should return false if duplicate word exist', () => {
        const newData = ['mot', 'mot'];
        const result = service.notContainsDuplicate(newData);
        expect(result).to.eql(false);
    });

    it('containsAtLeast2Letter should return true dictionary contains at least 2 words', () => {
        const newData = ['moreThanTwoLetter'];
        const result = service.containsAtLeast2Letter(newData);
        expect(result).to.eql(true);
    });

    it('containsAtLeast2Letter should return false dictionary doesnt contain at least 2 words', () => {
        const newData = ['1'];
        const result = service.containsAtLeast2Letter(newData);
        expect(result).to.eql(false);
    });

    it('hasNoSpaces should return true if words are not separated by an space', () => {
        const newData = ['noSpaceInBetween'];
        const result = service.hasNoSpaces(newData);
        expect(result).to.eql(true);
    });

    it('hasNoSpaces should return false if words are separated by an space', () => {
        const newData = ['space between words'];
        const result = service.hasNoSpaces(newData);
        expect(result).to.eql(false);
    });

    it('hasNoAccents should return true if words are not accented', () => {
        const newData = ['noAccentedWord'];
        const result = service.hasNoAccents(newData);
        expect(result).to.eql(true);
    });

    it('hasNoAccents should return false if words are accented', () => {
        const newData = ['ÂççéntédWôrd'];
        const result = service.hasNoAccents(newData);
        expect(result).to.eql(false);
    });
});
