/* eslint-disable @typescript-eslint/no-magic-numbers */
// on peut avoir des chiffre magique dans le fichier test

import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { RandomPlayerChoices } from './random-player-choices.service';
import { COMMANDS, POINTS } from '@app/constants/constants';

describe('RandomPlayerChoicesService', () => {
    let service: RandomPlayerChoices;
    beforeEach(() => {
        service = new RandomPlayerChoices();
    });

    it('should be created', () => {
        assert.isDefined(service);
    });

    it('randomGameCommand should return Placer command if random number under than 0.8', () => {
        const randomCommandStub = sinon.stub(Math, 'random').returns(0.5);
        const expectedCommand = COMMANDS.Placer;
        const gameCommand = service.randomGameCommand();
        expect(expectedCommand).to.eql(gameCommand);
        randomCommandStub.restore();
    });

    it('randomGameCommand should return Échanger command if random number over than 0.8 and under 0.9', () => {
        const randomCommandStub = sinon.stub(Math, 'random').returns(0.85);
        const expectedCommand = COMMANDS.Échanger;
        const gameCommand = service.randomGameCommand();
        expect(expectedCommand).to.eql(gameCommand);
        randomCommandStub.restore();
    });

    it('randomGameCommand should return Passer command if random number over than 0.9 and under 1', () => {
        const randomCommandStub = sinon.stub(Math, 'random').returns(0.95);
        const expectedCommand = COMMANDS.Passer;
        const gameCommand = service.randomGameCommand();
        expect(expectedCommand).to.eql(gameCommand);
        randomCommandStub.restore();
    });

    it('randomPlaceChoices should return 6 points if probability is under 0.4', () => {
        const randomPlaceChoiceStub = sinon.stub(Math, 'random').returns(0.3);
        const expectedPoints = POINTS.SixOrLess;
        const points = service.randomPlaceChoices();
        expect(expectedPoints).to.eql(points);
        randomPlaceChoiceStub.restore();
    });

    it('randomPlaceChoices should return 12 points if probability is over 0.4 and under 0.7', () => {
        const randomPlaceChoiceStub = sinon.stub(Math, 'random').returns(0.5);
        const expectedPoints = POINTS.SevenToTwelve;
        const points = service.randomPlaceChoices();
        expect(expectedPoints).to.eql(points);
        randomPlaceChoiceStub.restore();
    });

    it('randomPlaceChoices should return 18 points if probability is over 0.7 and under 1', () => {
        const randomPlaceChoiceStub = sinon.stub(Math, 'random').returns(0.8);
        const expectedPoints = POINTS.ThirteenToEighteen;
        const points = service.randomPlaceChoices();
        expect(expectedPoints).to.eql(points);
        randomPlaceChoiceStub.restore();
    });

    it('randomExchangeChoices should return return a number in [0, 7] interval', () => {
        const number = service.randomExchangeChoices();
        expect(number).to.be.within(0, 7);
    });
});
