/* eslint-disable import/no-unresolved */
/* eslint-disable dot-notation */
// acceder aux attributs prives

import { Server } from 'app/server';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { VirtualPlayerService } from './virtual-player.service';
import { assert, expect } from 'chai';
import * as io from 'socket.io';
import { ScrabbleClassicSolo } from '@app/classes//scrabble-classic-solo';
import { Command } from '@app/interfaces/command';
import { Placement } from '@app/interfaces/placement';
import { LEVEL } from '@app/constants/constants';

describe('SocketManager service tests', () => {
    let service: VirtualPlayerService;
    let firstPlayer: string;
    let secondPlayer: string;
    let fileName: string;
    let scrabbleGame: ScrabbleClassicSolo;
    let server: Server;
    let sio: io.Server;

    beforeEach(async () => {
        server = Container.get(Server);
        sinon.stub(server['dataBaseService'], 'start');
        await server.init();
        sio = new io.Server(server['server'], { cors: { origin: '*', methods: ['GET', 'POST'] } });

        firstPlayer = 'Player1';
        secondPlayer = 'Player2';
        fileName = 'dictionnary.json';
        service = new VirtualPlayerService(sio);
        scrabbleGame = new ScrabbleClassicSolo(firstPlayer, secondPlayer, fileName, LEVEL.Beginner, false);
    });

    afterEach(() => {
        service['sio'].close();
        sinon.restore();
    });

    it('virtualPlayerPlace should return empty placement if the points is 0', () => {
        const placement: Placement = {
            letters: [],
            points: 0,
            command: '',
        };
        const stubPlaceWord = sinon.stub(scrabbleGame, 'placeWordVirtual').returns(placement);
        const successPlacement = service.virtualPlayerPlace('room1', scrabbleGame);
        expect(successPlacement).to.eql(false);
        stubPlaceWord.restore();
    });

    it('virtualPlayerPlace should send the command if points is not 0', () => {
        const placement: Placement = {
            letters: [],
            points: 12,
            command: 'placer',
        };
        const stubPlaceWord = sinon.stub(scrabbleGame, 'placeWordVirtual').returns(placement);

        const spy = sinon.spy(service['sio'], 'to');
        service.virtualPlayerPlace('room1', scrabbleGame);
        assert(spy.called);
        stubPlaceWord.restore();
    });

    it('virtualPlayerExchange should call virtualPlayerPass if theres no letter to exchange', () => {
        const stubLettersExchange = sinon.stub(scrabbleGame, 'lettersToExchange').get(() => '');
        const successExchange = service.virtualPlayerExchange('room1', scrabbleGame);
        expect(successExchange).to.eql(false);
        stubLettersExchange.restore();
    });

    it('virtualPlayerExchange should call virtualPlayerPass if command type is system', () => {
        const command: Command = {
            display: 'display',
            name: 'placer',
            type: 'system',
        };
        const stubCommand = sinon.stub(scrabbleGame, 'exchangeLetters').returns(command);

        const successExchange = service.virtualPlayerExchange('room1', scrabbleGame);
        expect(successExchange).to.eql(false);
        stubCommand.restore();
    });

    it('virtualPlayerExchange should send an event if the type is not systeme and letter to exchange is not empty', (done) => {
        const command: Command = {
            display: 'display',
            name: 'placer',
            type: 'game',
        };
        const stubCommand = sinon.stub(scrabbleGame, 'exchangeLetters').returns(command);

        const spy = sinon.spy(service['sio'], 'to');
        service.virtualPlayerExchange('room1', scrabbleGame);
        assert(spy.called);
        stubCommand.restore();
        done();
    });

    it('virtualPlayerPass should incrementStreakPass', () => {
        const spy = sinon.stub(ScrabbleClassicSolo.prototype, 'incrementStreakPass');
        service.virtualPlayerPass('room1', scrabbleGame);
        assert(spy.called);
    });
});
