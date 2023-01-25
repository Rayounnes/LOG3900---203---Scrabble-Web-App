/* eslint-disable dot-notation */
// on utilise dot-notation pour acceder aux attributs prives

import { COMMANDS, LEVEL } from '@app/constants/constants';
import { ChevaletService } from '@app/services/chevalet.service';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { ScrabbleClassicSolo } from './scrabble-classic-solo';
import { Placement } from '@app/interfaces/placement';
import { HintWordsService } from '@app/services/hint-words.service';
import { INVALID_PLACEMENT } from '@app/constants/hint-constants';
import { ExchangeLettersService } from '@app/services/exchange-letters.service';

describe('Scrabble Classic Solo', () => {
    let game: ScrabbleClassicSolo;
    let firstPlayer: string;
    let virtualPlayer: string;
    let fileName: string;

    beforeEach(async () => {
        firstPlayer = 'Player1';
        virtualPlayer = 'VirtualPlayer1';
        fileName = 'dictionnary.json';
        game = new ScrabbleClassicSolo(firstPlayer, virtualPlayer, fileName, LEVEL.Beginner, false);
    });

    it('game is created', () => {
        assert.isDefined(game);
    });

    it('findPlacement method should return a random indice when level is beginner', () => {
        const placement1 = { letters: [{ line: 7, column: 7, value: 'fan' }], points: 3, command: '!placer' };
        const placement2 = { letters: [{ line: 2, column: 8, value: 'fou' }], points: 3, command: '!placer' };
        const listPlacement: Placement[] = [placement1, placement2];
        const stubFloor = sinon.stub(Math, 'floor').returns(0);
        const stubPlacement = sinon.stub(HintWordsService.prototype, 'getAllWordsInPointsScale').returns(listPlacement);

        const expectedResult = placement1;
        expect(expectedResult).to.eql(game.findPlacement());
        stubFloor.restore();
        stubPlacement.restore();
    });

    it('findPlacement method should return invalid placement if the choices is empty when level is beginner', () => {
        const listPlacement: Placement[] = [];
        const expectedResult = INVALID_PLACEMENT;
        const stubRack = sinon.stub(HintWordsService.prototype, 'getAllWordsInPointsScale').returns(listPlacement);
        const stubNumLetters = sinon.stub(game['randomVirtualChoices'], 'randomExchangeChoices').returns(3);
        expect(expectedResult).to.eql(game.placeWordVirtual());
        stubRack.restore();
        stubNumLetters.restore();
    });
    it('findPlacement method should call getMostPointsPlacement when level is expert', () => {
        game['playerDifficulty'] = LEVEL.Expert;
        const placement1 = { letters: [{ line: 7, column: 7, value: 'fan' }], points: 3, command: '!placer' };
        const stubPlacement = sinon.stub(HintWordsService.prototype, 'getMostPointsPlacement').returns(placement1);
        const expectedResult = placement1;
        const result = game.findPlacement();
        expect(expectedResult).to.eql(result);
        assert(stubPlacement.called);
        stubPlacement.restore();
    });

    it('findPlacement method should return invalid placement when placement not found and level is expert', () => {
        game['playerDifficulty'] = LEVEL.Expert;
        const expectedResult = INVALID_PLACEMENT;
        const stubPlacement = sinon.stub(HintWordsService.prototype, 'getMostPointsPlacement').returns(INVALID_PLACEMENT);
        expect(expectedResult).to.eql(game.findPlacement());
        stubPlacement.restore();
    });
    it('findPlacement method should return invalid placement when level is not Beginner or Expert', () => {
        game['playerDifficulty'] = 'error';
        const expectedResult = INVALID_PLACEMENT;
        expect(expectedResult).to.eql(game.findPlacement());
    });
    it('placeWordVirtual method should not reset passStreak and not call placeLetters and pointsUpdate when invalid placement', () => {
        const pass = 3;
        game['passStreak'] = pass;
        const stubPlacement = sinon.stub(game, 'findPlacement').returns(INVALID_PLACEMENT);
        const boardStub = sinon.stub(game['board'], 'placeLetters');
        const pointsStub = sinon.stub(game, 'pointsUpdate');
        game.placeWordVirtual();
        assert(boardStub.notCalled);
        assert(pointsStub.notCalled);
        expect(game['passStreak']).to.eql(pass);
        stubPlacement.restore();
        boardStub.restore();
        pointsStub.restore();
    });

    it('placeWordVirtual method should reset passStreak and call placeLetters and pointsUpdate when placement is valid', () => {
        const pass = 3;
        game['passStreak'] = pass;
        const placement1 = { letters: [{ line: 7, column: 7, value: 'fan' }], points: 3, command: '!placer' };
        const stubPlacement = sinon.stub(game, 'findPlacement').returns(placement1);
        const boardStub = sinon.stub(game['board'], 'placeLetters');
        const pointsStub = sinon.stub(game, 'pointsUpdate');
        game.placeWordVirtual();
        assert(boardStub.called);
        assert(pointsStub.called);
        expect(game['passStreak']).to.eql(0);
        stubPlacement.restore();
        boardStub.restore();
        pointsStub.restore();
    });

    it('lettersToExchange methode should exchange first three letters', () => {
        const stubRack = sinon.stub(ChevaletService.prototype, 'rackInString').get(() => 'abcdefg');
        const stubNumLetters = sinon.stub(game['randomVirtualChoices'], 'randomExchangeChoices').returns(3);
        const expectedLettersToExchange = 'abc';
        const lettersToExchange = game.lettersToExchange;
        expect(expectedLettersToExchange).to.eql(lettersToExchange);
        stubRack.restore();
        stubNumLetters.restore();
    });

    it('lettersToExchange methode should return reserve length number of letters if rack is greater than reserve in expert mode', () => {
        game['playerDifficulty'] = 'Expert';
        const stubRack = sinon.stub(ChevaletService.prototype, 'rackInString').get(() => 'abcdcef');
        const reserveLength = 4;
        const stubReserve = sinon.stub(game, 'getReserveLettersLength').returns(reserveLength);
        const lettersToExchange = game.lettersToExchange;
        expect(lettersToExchange.length).to.eql(reserveLength);
        stubRack.restore();
        stubReserve.restore();
    });
    it('lettersToExchange methode should return all rack letters if reserve is greater than rack in expert mode', () => {
        game['playerDifficulty'] = 'Expert';
        const letters = 'abcdcef';
        const stubRack = sinon.stub(ChevaletService.prototype, 'rackInString').get(() => letters);
        const reserveLength = 10;
        const stubReserve = sinon.stub(game, 'getReserveLettersLength').returns(reserveLength);
        const lettersToExchange = game.lettersToExchange;
        expect(lettersToExchange).to.eql(letters);
        stubRack.restore();
        stubReserve.restore();
    });
    it('lettersToExchange should return no letters if reserve is empty', () => {
        const stubRack = sinon.stub(ChevaletService.prototype, 'rackInString').get(() => 'abcdcef');
        const stubReserve = sinon.stub(game, 'getReserveLettersLength').returns(0);
        const expectedLettersToExchange = '';
        const lettersToExchange = game.lettersToExchange;
        expect(expectedLettersToExchange).to.eql(lettersToExchange);
        stubRack.restore();
        stubReserve.restore();
    });
    it('exchangeVirtualPlayer should call exchangeLetters when virtual player level is Beginner', () => {
        game['playerDifficulty'] = 'Débutant';
        const stubExchange = sinon.stub(game, 'exchangeLetters');
        game.exchangeVirtualPlayer(game.lettersToExchange);
        assert(stubExchange.called);
        stubExchange.restore();
    });
    it('exchangeVirtualPlayer should call exchangeLetters of exchange service when virtual player level is Expert', () => {
        game['playerDifficulty'] = 'Expert';
        game['turnSocket'] = game.virtualName;
        const reserveLength = 4;
        game['passStreak'] = 4;
        const oldRack = game['gamePlayers'].get(game.virtualName)?.lettersRack.rackInString as string;
        const stubReserve = sinon.stub(game, 'getReserveLettersLength').returns(reserveLength);
        const spyExchange = sinon.spy(ExchangeLettersService.prototype, 'exchangeLetters');
        const spyChange = sinon.spy(game, 'changeExchangeCounter');
        game.exchangeVirtualPlayer(game.lettersToExchange);
        const newRack = game['gamePlayers'].get(game.virtualName)?.lettersRack.rackInString as string;
        expect(oldRack).not.to.eql(newRack);
        assert(spyExchange.called);
        assert(spyChange.called);
        stubReserve.restore();
    });
    it('virtualName methode should return virtualPlayer', () => {
        const expectedVirtualPlayer = game['virtualPlayer'];
        expect(expectedVirtualPlayer).to.eql(game.virtualName);
    });

    it('commandVirtualPlayer methode should return random command', () => {
        const randomCommandStub = sinon.stub(game['randomVirtualChoices'], 'randomGameCommand').returns(COMMANDS.Passer);
        const expectedcommand = 'passer';
        expect(expectedcommand).to.eql(game.commandVirtualPlayer);
        randomCommandStub.restore();
    });
});
