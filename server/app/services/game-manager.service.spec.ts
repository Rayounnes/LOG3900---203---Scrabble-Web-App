/* eslint-disable max-lines */
/* eslint-disable dot-notation */
// acceder aux membres privés du service
import { SocketManager } from './socket-manager.service';
import { GameManager } from '@app/services/game-manager.service';
import { Server } from 'app/server';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { assert, expect } from 'chai';
import { io as ioClient, Socket } from 'socket.io-client';
import { ScrabbleClassic } from '@app/classes/scrabble-classic';
import { SoloGame } from '@app/interfaces/solo-game';
import { SocketUser } from '@app/interfaces/socket-user';
import { Game } from '@app/interfaces/game';
import { Dictionary } from '@app/interfaces/dictionary';
import { LEVEL } from '@app/constants/constants';

describe('GameManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let gameManager: GameManager;
    let socketId: string;
    let room: string;
    let hostSocket: Socket;
    let joinedSocket: Socket;
    let game: ScrabbleClassic;
    let match: Game;
    let fileName: string;
    const urlString = 'http://localhost:3000';

    beforeEach(async () => {
        server = Container.get(Server);
        socketId = 'test';
        room = 'room1';
        sinon.stub(server['dataBaseService'], 'start');
        await server.init();
        service = server['socketManger'];
        gameManager = service['gameManager'];
        hostSocket = ioClient(urlString);
        joinedSocket = ioClient(urlString);
        fileName = 'dictionnary.json';
        game = new ScrabbleClassic(hostSocket.id, joinedSocket.id, fileName, false);
        gameManager['scrabbleGames'].set(room, game);
        gameManager['usersRoom'].set(socketId, room);
        gameManager['usersRoom'].set(hostSocket.id, room);
        gameManager['usersRoom'].set(joinedSocket.id, room);
        match = {
            usernameOne: 'Zabi',
            time: 40,
            mode: 'classic',
            dictionary: {} as Dictionary,
            room: 'room1',
            isJoined: false,
            usernameTwo: 'Hello',
            hostID: hostSocket.id,
        } as Game;
        gameManager['usernames'].set(hostSocket.id, match.usernameOne);
    });

    afterEach(() => {
        hostSocket.close();
        joinedSocket.close();
        service['sio'].close();
        sinon.restore();
    });

    it('leaveRoom should shoud delete the socket from the usernames and userRooms ', () => {
        const spyUsersRoom = sinon.spy(gameManager['usersRoom'], 'delete');
        const spyUsersName = sinon.spy(gameManager['usernames'], 'delete');
        gameManager.leaveRoom(socketId);
        assert(spyUsersRoom.called);
        assert(spyUsersName.called);
    });
    it('leaveRoom should should delete the socket from the usernames and userRooms ', () => {
        const spyUsersRoom = sinon.spy(gameManager['usersRoom'], 'delete');
        const spyUsersName = sinon.spy(gameManager['usernames'], 'delete');
        gameManager.leaveRoom(socketId);
        assert(spyUsersRoom.called);
        assert(spyUsersName.called);
    });
    it('endGameMessage should call transformEndGameMessage ', () => {
        const stubGame = sinon.stub(ScrabbleClassic.prototype, 'gameEndedMessage');
        const stubEnd = sinon.stub(gameManager, 'transformEndGameMessage');
        gameManager.endGameMessage(room, gameManager['scrabbleGames'].get(room) as ScrabbleClassic);
        assert(stubEnd.called);
        stubGame.restore();
        stubEnd.restore();
    });
    it('transformEndGameMessage should return the good format of the end message', () => {
        const expectedEndMessage = 'Fin de partie - lettres restantes\ntest : abc\ntest1 : def';
        const socketLetters = ['test', 'abc', 'test1', 'def'];
        const endMessage = gameManager.transformEndGameMessage(socketLetters);
        expect(endMessage).to.eql(expectedEndMessage);
    });
    it('abandonGame should call transformToSoloGame ,findOpponentSocket and virtual play if turn is for virtual player ', () => {
        match.hostID = 'socket1';
        match.dictionary.fileName = 'dictionnary.json';
        const stubPlayer = sinon.stub(gameManager, 'virtualPlayerPlay');
        const stubOponnent = sinon.stub(gameManager, 'findOpponentSocket').returns(hostSocket.id);
        const stubToSoloGame = sinon.stub(gameManager, 'transformToSoloGame').returns(match as SoloGame);
        game['turnSocket'] = 'Marc';
        const spy = sinon.spy(service['sio'], 'to');
        gameManager.abandonGame(joinedSocket.id);
        assert(stubPlayer.called);
        assert(stubToSoloGame.called);
        assert(spy.calledWith(hostSocket.id));
        stubPlayer.restore();
        stubToSoloGame.restore();
        stubOponnent.restore();
    });
    it('isEndGame should return true and call endGameMessage when game is finished ', () => {
        const stubEnd = sinon.stub(gameManager, 'endGameMessage');
        const stubGameEnd = sinon.stub(ScrabbleClassic.prototype, 'gameEnded').returns(true);
        const isEnd = gameManager.isEndGame(room, game);
        assert(stubEnd.called);
        expect(isEnd).to.eql(true);
        stubGameEnd.restore();
        stubEnd.restore();
    });
    it('isEndGame should return true and call endGameMessage and put isFinished when solo game is finished ', () => {
        const soloGame = {
            usernameOne: 'Nabil',
            time: 30,
            mode: 'solo',
            dictionary: {},
            difficulty: 'Débutant',
            room: 'room1',
            virtualPlayerName: 'Marc',
            isFinished: false,
        } as SoloGame;
        gameManager['gameRooms'].set(room, soloGame);
        const stubEnd = sinon.stub(gameManager, 'endGameMessage');
        const stubGameEnd = sinon.stub(ScrabbleClassic.prototype, 'gameEnded').returns(true);
        const isEnd = gameManager.isEndGame(room, game);
        assert(stubEnd.called);
        expect(isEnd).to.eql(true);
        expect(soloGame.isFinished).to.eql(true);
        stubGameEnd.restore();
        stubEnd.restore();
    });
    it('isEndGame should return false and not call endGameMessage when game is not finished ', () => {
        const stubEnd = sinon.stub(gameManager, 'endGameMessage');
        const stubGameEnd = sinon.stub(ScrabbleClassic.prototype, 'gameEnded').returns(false);
        const isEnd = gameManager.isEndGame(room, game);
        assert(stubEnd.notCalled);
        expect(isEnd).to.eql(false);
        stubGameEnd.restore();
        stubEnd.restore();
    });
    it('refreshGame should call changeSocket,leave room ,boardLetters,updatePannel and updateScores ', () => {
        const stubLeave = sinon.stub(gameManager, 'leaveRoom');
        const stubPannel = sinon.stub(gameManager, 'updatePannel');
        const stubScore = sinon.stub(gameManager, 'updateScores');
        const stubChange = sinon.stub(ScrabbleClassic.prototype, 'changeSocket');
        // raison stub pour rien get
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const stubBoard = sinon.stub(ScrabbleClassic.prototype, 'boardLetters').get(() => {});
        const disconnectUser: SocketUser = { oldSocketId: socketId, newSocketId: 'test' };
        gameManager.refreshGame(socketId, disconnectUser, room);
        assert(stubLeave.called);
        assert(stubPannel.called);
        assert(stubScore.called);
        assert(stubChange.called);
        stubLeave.restore();
        stubPannel.restore();
        stubScore.restore();
        stubChange.restore();
        stubBoard.restore();
    });
    it('updatePannel should change the hostId with the new id if the refresh socket was the host ', () => {
        const expectedMatch = {
            usernameOne: 'Zabi',
            time: 40,
            mode: 'classic',
            dictionary: {},
            room: 'room1',
            isJoined: false,
            usernameTwo: 'Hello',
            hostID: 'test',
        } as Game;
        const disconnectUser: SocketUser = { oldSocketId: hostSocket.id, newSocketId: 'test' };
        gameManager.updatePannel(match, disconnectUser);
        expect(match).to.eql(expectedMatch);
    });
    it('updatePannel should send the new match when socket was not the host ', () => {
        const matchTest = {
            usernameOne: 'Zabi',
            time: 40,
            mode: 'classic',
            dictionary: {},
            room: 'room1',
            isJoined: false,
            usernameTwo: 'Hello',
            hostID: 'notId',
        } as Game;
        const disconnectUser: SocketUser = { oldSocketId: hostSocket.id, newSocketId: 'test' };
        const spyMatch = sinon.spy(service['sio'], 'to');
        gameManager.updatePannel(matchTest, disconnectUser);
        assert(spyMatch.calledWith(disconnectUser.newSocketId));
    });
    it('updateScores should call getPlayerScore and getPlayerTilesLeft twice', () => {
        const stubScore = sinon.stub(game, 'getPlayerScore');
        const stubTiles = sinon.stub(game, 'getPlayerTilesLeft');
        const disconnectUser: SocketUser = { oldSocketId: hostSocket.id, newSocketId: 'test' };
        gameManager.updateScores(disconnectUser, game);
        assert(stubScore.calledTwice);
        assert(stubTiles.calledTwice);
        stubScore.restore();
        stubTiles.restore();
    });
    it('transformToSoloGame should modify the game to solo game', () => {
        const soloGame = gameManager.transformToSoloGame(match as SoloGame, hostSocket.id);
        const expectedSoloMatch = {
            usernameOne: 'Zabi',
            time: 40,
            mode: 'classic',
            type: 'solo',
            dictionary: {} as Dictionary,
            room: 'room1',
            isJoined: false,
            isFinished: false,
            usernameTwo: 'Marc',
            virtualPlayerName: 'Marc',
            hostID: hostSocket.id,
            difficulty: LEVEL.Beginner,
        } as SoloGame;
        expect(soloGame).to.eql(expectedSoloMatch);
    });
});
