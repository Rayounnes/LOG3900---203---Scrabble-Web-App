import { TestBed } from '@angular/core/testing';

import { ArgumentManagementService } from './argument-management.service';

describe('ArgumentManagementService', () => {
    let service: ArgumentManagementService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new ArgumentManagementService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('verifyInvalidCharacters should return true if the character is invalid', () => {
        const invalidCharacter = 'am-i';
        expect(service.verifyInvalidCharacters(invalidCharacter)).toBeTruthy();
    });

    it('verifyInvalidCharacters should return false if the character is valid', () => {
        const invalidCharacter = 'ami';
        expect(service.verifyInvalidCharacters(invalidCharacter)).toBeFalsy();
    });

    it('verificationOrientation should return true if the orientation is h', () => {
        const resultH = service.verificationOrientation('h', 'ddd');
        expect(resultH).toBeTruthy();
    });
    it('verificationOrientation should return true if the orientation is v', () => {
        const resultV = service.verificationOrientation('v', 'ddd');
        expect(resultV).toBeTruthy();
    });
    it('verificationOrientation should return false if the orientation is not v or h and the length of the word is not 1', () => {
        const resultR = service.verificationOrientation('r', 'ddd');
        expect(resultR).toBeFalsy();
    });
    it('verificationOrientation should return true if there is no orientation and the length of the word is 1', () => {
        service.splitMessage('!placer a2 d');
        const resultR = service.verificationOrientation('', 'd');
        expect(resultR).toBeTruthy();
    });
    it('verificationColumn should return true if the column number is in the range (0,15)', () => {
        let isValid = true;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        for (let i = 1; i < 15; i++) {
            if (!service.verificationColumn(i)) isValid = false;
        }
        expect(isValid).toBeTruthy();
    });
    it('verificationColumn should return false if the column number is not in the range (0,15)', () => {
        const outValue = 16;
        expect(service.verificationColumn(outValue)).toBeFalsy();
    });
    it('verificationLine should return true if the line number is in the range (a,o)', () => {
        const minValue = 0;
        const maxValue = 15;

        let isValid = true;
        for (let i = minValue; i < maxValue; i++) {
            if (!service.verificationLine(i)) isValid = false;
        }
        expect(isValid).toBeTruthy();
    });
    it('splitMessage should return false if the length of the splitted message is different than 3 ', () => {
        const shortMessage = 'ami oui';
        expect(service.splitMessage(shortMessage)).toBeFalsy();
    });

    it('createWordObject should return an object if the message is valid  ', () => {
        const validMessage = '!placer a1h ami';
        service.splitMessage(validMessage);
        expect(service.createWordObject()).toEqual({ line: 0, column: 0, orientation: 'h', value: 'ami' });
    });
    it('createWordObject should return false if the message is inValid  ', () => {
        const invalidMessage = '!placer a1r ami';
        service.splitMessage(invalidMessage);
        expect(service.createWordObject()).toBeFalsy();
    });
    it('formatInput should call createWord if the length of the splitted message is 3 ', () => {
        const validLengthMessage = '!placer a1h ami';
        const createWordSpy = spyOn(service, 'createWordObject').and.callThrough();
        service.formatInput(validLengthMessage);
        expect(createWordSpy).toHaveBeenCalled();
    });
    it('formatInput should return false if the length of the splitted message is not 3', () => {
        const invalidLengthMessage = '!placer a1h';
        expect(service.formatInput(invalidLengthMessage)).toBeFalsy();
    });

    it('validation should call verificationOrientation()', () => {
        const spyVerificationOrientation = spyOn(service, 'verificationOrientation');
        service.validation();
        expect(spyVerificationOrientation).toHaveBeenCalled();
    });
    it('validation should call verificationColumn()', () => {
        const spyVerificationColumn = spyOn(service, 'verificationColumn');
        service.splitMessage('!placer a1h ami');
        service.validation();
        expect(spyVerificationColumn).toHaveBeenCalled();
    });
    it('validation should call verificationLine()', () => {
        service.splitMessage('!placer a2h deee');
        const spyVerificationLine = spyOn(service, 'verificationLine');
        service.validation();
        expect(spyVerificationLine).toHaveBeenCalled();
    });

    it('verificationWord should return true if the word exists and contains valid characters', () => {
        service.splitMessage('!placer a2h deee');
        expect(service.verificationWord).toBeTruthy();
    });
    it('verificationWord should return false if the word contains invalid characters', () => {
        service.splitMessage('!placer a2h d-eee');
        const result = service.verificationWord();
        expect(result).toBeFalsy();
    });
});
