/* eslint-disable dot-notation */
// acceder aux membres privés de la classe
import { ChevaletService } from './chevalet.service';
import { ReserveService } from './reserve.service';
import { expect, assert } from 'chai';
import * as sinon from 'sinon';

describe('ChevaletService', () => {
    let service: ChevaletService;
    let reserveService: ReserveService;

    beforeEach(() => {
        reserveService = new ReserveService();
        service = new ChevaletService(reserveService);
    });

    it('should be created', () => {
        assert.isDefined(service);
    });
    it('getLetter return a correct letter', () => {
        const letter = reserveService.getLetter();
        expect(reserveService.reserve.has(letter)).to.eql(true);
    });

    it('fillRackWithLetters should call getLetter', () => {
        const randomLettersOnRackSpy = sinon.spy(reserveService, 'getLetter');
        service.fillRackWithLetters();
        assert(randomLettersOnRackSpy.called);
    });
    it('the function removeLettersOnRack should removed letters from rack and add new letters', () => {
        service.fillRackWithLetters();
        const rack = [...service.lettersRack];
        service.removeLettersOnRack([rack[0], rack[1], rack[2]]);
        const expectedRack = service.lettersRack;
        expect(rack).to.not.eql(expectedRack);
    });
    it('the function areLettersInRack should find letters in rack', () => {
        const letters = 'test';
        const rackLetters: string[] = ['a', '*', 't', 'e', 's', 't', '*'];
        service['chevalet'] = rackLetters;
        const response = service.areLettersInRack(letters);
        expect(response).to.eql(true);
    });
    it('the function areLettersInRack should find letters from rack even when its white letter', () => {
        const letters = 'TEst';
        const rackLetters: string[] = ['a', '*', 't', 'e', 's', 't', '*'];
        service['chevalet'] = rackLetters;
        const response = service.areLettersInRack(letters);
        expect(response).to.eql(true);
    });

    it('the function areLettersInRack should not find letters from rack', () => {
        const letters = 'lourd';
        const rackLetters: string[] = ['a', '*', 't', 'e', 's', 't', '*'];
        service['chevalet'] = rackLetters;
        const response = service.areLettersInRack(letters);
        expect(response).to.eql(false);
    });

    it('getPositionsOfLettersOnRack should return the position on the rack of the letters', () => {
        const rackLetters: string[] = ['a', 'e', 'b', 'h', 'r', 'l', '*'];
        service['chevalet'] = rackLetters;
        const pos1 = 0;
        const pos2 = 5;
        const pos3 = 6;
        const expectedArrayPosOfLetters = [pos1, pos2, pos3];
        const arrayPosOfLetters = service.getPositionsOfLettersOnRack(['a', 'l', '*']);
        expect(arrayPosOfLetters).to.eql(expectedArrayPosOfLetters);
    });
    it('isRackEmpty should return false if no letter are on rack', () => {
        const rackLetters: string[] = ['', '', '', '', '', '', ''];
        service['chevalet'] = rackLetters;
        const response = service.isRackEmpty();
        expect(response).to.eql(true);
    });
    it('isRackEmpty should return  true if one or more letters are on rack', () => {
        const rackLetters: string[] = ['', '', '', '', '*', '', ''];
        service['chevalet'] = rackLetters;
        const response = service.isRackEmpty();
        expect(response).to.eql(false);
    });
    it('calculateRackPoints should return  the total value of letters in rack', () => {
        const rackLetters: string[] = ['a', '', 'z', 'c', '*', '', 'q'];
        const totalPoints = 22;
        service['chevalet'] = rackLetters;
        const points = service.calculateRackPoints();
        expect(points).to.eql(totalPoints);
    });
    it('rackInString should return  the good format string of the rack', () => {
        const rackLetters: string[] = ['a', '', 'z', 'c', '*', '', 'q'];
        const expectStringRack = 'azc*q';
        service['chevalet'] = rackLetters;
        const rackString = service.rackInString;
        expect(rackString).to.eql(expectStringRack);
    });
});
