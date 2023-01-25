/* eslint-disable max-lines */
/* eslint-disable dot-notation */
// acceder aux membres privés du service
import { Game } from '@app/interfaces/game';
import { Letter } from '@app/interfaces/lettre';
import { ScrabbleClassic } from '@app/classes/scrabble-classic';
import { ScrabbleClassicSolo } from '@app/classes/scrabble-classic-solo';
import { SoloGame } from '@app/interfaces/solo-game';
import { COMMANDS, LEVEL } from '@app/constants/constants';
import { GameManager } from '@app/services/game-manager.service';
import { Server } from 'app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';
import { Dictionary } from '@app/interfaces/dictionary';

const RESPONSE_DELAY = 450;
const SOCKET_GAME_DELAY = 150;
describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let hostSocket: Socket;
    let joinedSocket: Socket;
    let match: Game;
    let soloMatch: SoloGame;
    let gameManager: GameManager;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        sinon.stub(server['dataBaseService'], 'start');
        await server.init();
        service = server['socketManger'];
        gameManager = service['gameManager'];
        hostSocket = ioClient(urlString);
        joinedSocket = ioClient(urlString);
        soloMatch = {
            usernameOne: 'Nabil',
            time: 30,
            mode: 'classic',
            type: 'solo',
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            difficulty: LEVEL.Beginner,
            room: 'room1',
            virtualPlayerName: 'Marc',
            isFinished: false,
        } as SoloGame;
        match = {
            usernameOne: 'Zabi',
            time: 40,
            mode: 'classic',
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            room: 'room1',
            isJoined: false,
            usernameTwo: 'Hello',
        } as Game;
    });

    afterEach(() => {
        hostSocket.close();
        joinedSocket.close();
        service['sio'].close();
        sinon.restore();
    });
    const gameCreation = async (mode: string) => {
        match.mode = mode;
        hostSocket.emit('create-game', match);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('waiting-room-second-player', match);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        hostSocket.emit('join-game', { playerUsername: 'user', mode: match.mode });
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
    };

    it('create-solo-game should call changeRoomName', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        const spy = sinon.spy(service, 'changeRoomName');
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        stubTurn.restore();
    });
    it('create game should call changeRoomName', async () => {
        const spy = sinon.spy(service, 'changeRoomName');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('kick-user should call leaveRoom', async () => {
        // const parameter = {
        //     game: match,
        //     username: 'test',
        // };
        const spy = sinon.spy(gameManager, 'leaveRoom');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('waiting-room-second-player', match);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        hostSocket.emit('kick-user', match.usernameTwo);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('joined-user-left should call leaveRoom', async () => {
        // const parameter = {
        //     game: match,
        //     username: 'test',
        // };
        const spy = sinon.spy(gameManager, 'leaveRoom');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('waiting-room-second-player', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('joined-user-left');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('waiting-room-second-player should call add player to user of usersRoom', async () => {
        // const parameter = {
        //     game: match,
        //     username: 'tst',
        // } as unknown;
        const spy = sinon.spy(service['usersRoom'], 'set');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('waiting-room-second-player', match);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('sendUsername should call get usernames', async () => {
        const spy = sinon.spy(service['usernames'], 'get');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        hostSocket.emit('sendUsername');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('update-joinable-matches should call gameRooms', async () => {
        const spy = sinon.spy(service['gameRooms'], 'values');
        hostSocket.emit('update-joinable-matches');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('cancel-match should delete the game from gameRooms', async () => {
        const spy = sinon.spy(service['gameRooms'], 'delete');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        joinedSocket.emit('waiting-room-second-player', match);

        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        hostSocket.emit('cancel-match');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('chatMessage should send message to the right room', async () => {
        const spy = sinon.spy(service['sio'], 'to');
        await gameCreation('classic');
        hostSocket.emit('chatMessage', 'message');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(match.room));
    });
    it('draw-letters-rack should call  emit the rack only to the socket who sent it', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('draw-letters-rack');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('user-turn should call  the right game to toggleTurn', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(service['scrabbleGames'], 'get');
        hostSocket.emit('change-user-turn');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(match.room));
    });
    it('verifyPlaceCommand should emit the verification to the sent socket', async () => {
        const command = {
            line: 0,
            column: 0,
            value: 'test',
            orientation: 'v',
        };
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('verify-place-message', command);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('validate-created-words should emit the points and letters to the sent socket', async () => {
        const lettersTest: Letter[] = [{ line: 2, column: 3, value: 'a' }];
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('validate-created-words', { letters: lettersTest });

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });

    it('draw-letters-opponent should emit draw letters to the opponent ', async () => {
        const lettersTest: Letter[] = [{ line: 2, column: 3, value: 'a' }];
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('draw-letters-opponent', lettersTest);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(joinedSocket.id));
    });

    it('remove-letters-rack should emit draw-letters-rack to the same socket ', async () => {
        const lettersTest: Letter[] = [{ line: 2, column: 3, value: 'a' }];
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('remove-letters-rack', lettersTest);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('reserve-command should emit reserve-command to the same socket ', async () => {
        await gameCreation('classic');
        const testReserveResult = 'test';
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('reserve-command', testReserveResult);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('help-command should emit help-command to the same socket ', async () => {
        await gameCreation('classic');
        const testMessage = 'test';
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('help-command', testMessage);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('exchange-command should emit exchange-command to the same socket ', async () => {
        const lettersTest = 'test';
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('exchange-command', lettersTest);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });

    it('exchange-opponent-message should emit chatMessage to the same socket ', async () => {
        const lettersTest = 'test';
        await gameCreation('classic');
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('exchange-opponent-message', lettersTest.length);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(joinedSocket.id));
    });
    it('change-user-turn should call toggleTurn ', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(ScrabbleClassic.prototype, 'toggleTurn');
        hostSocket.emit('change-user-turn');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('validate-created-words should call transformEndGameMessage when game ended ', async () => {
        const lettersTest: Letter[] = [{ line: 2, column: 3, value: 'a' }];
        const stubValidate = sinon.stub(ScrabbleClassic.prototype, 'validateCalculateWordsPoints').returns(3);
        const stubEndGame = sinon.stub(ScrabbleClassic.prototype, 'gameEnded').returns(true);
        await gameCreation('classic');
        const spy = sinon.spy(gameManager, 'transformEndGameMessage');
        hostSocket.emit('validate-created-words', { letters: lettersTest, points: 50 });

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        stubValidate.restore();
        stubEndGame.restore();
    });
    it('pass-turn should call transformEndGameMessage when game ended with 6 pass', async () => {
        const stubEndGame = sinon.stub(ScrabbleClassic.prototype, 'gameEnded').returns(true);
        await gameCreation('classic');
        const spy = sinon.spy(gameManager, 'transformEndGameMessage');
        hostSocket.emit('pass-turn');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        stubEndGame.restore();
    });
    it('pass-turn should call incrementStreakPass when pass executed', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(ScrabbleClassic.prototype, 'incrementStreakPass');
        hostSocket.emit('pass-turn');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('send-player-score should emit update-player-score to the two players', async () => {
        await gameCreation('classic');
        const score = 5;
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('send-player-score', score);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });
    it('update-reserve should call reserveLettersLength of the game', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(ScrabbleClassic.prototype, 'getReserveLettersLength');
        hostSocket.emit('update-reserve');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('abandon-game should call abandonGame', async () => {
        await gameCreation('classic');
        const stub = sinon.stub(gameManager, 'abandonGame');
        hostSocket.emit('abandon-game');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(stub.called);
        stub.restore();
    });
    it('hint-command should call getPlayerHintWords with socket of the player', async () => {
        await gameCreation('classic');
        const stub = sinon.stub(ScrabbleClassic.prototype, 'getPlayerHintWords').returns('');
        hostSocket.emit('hint-command');

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(stub.calledWith(hostSocket.id));
        stub.restore();
    });
    it('dictionary selected should call emit', async () => {
        const spy = sinon.spy(service['sio'], 'emit');
        hostSocket.emit('dictionary-selected', match.dictionary);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('create-game should call emit', async () => {
        const spy = sinon.spy(service['sio'], 'emit');
        hostSocket.emit('create-game', match);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
    });

    it('create-solo-game should set a new ScrabbleGame', async () => {
        const spy = sinon.spy(service['scrabbleGames'], 'set');
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        stubTurn.restore();
    });
    it('abandon-game should not call abandonGame when mode is solo and should emit end-game', async () => {
        hostSocket.emit('create-solo-game', soloMatch);

        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        const spyEmit = sinon.spy(service['sio'], 'to');
        const spy = sinon.spy(gameManager, 'abandonGame');
        hostSocket.emit('abandon-game');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.notCalled);
        assert(spyEmit.called);
    });
    it('virtualPlayerCommand should call virtualPlayerPlace and isEndGame when command is place', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const stub = sinon.stub(ScrabbleClassicSolo.prototype, 'commandVirtualPlayer').get(() => COMMANDS.Placer);
        const placeStub = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerPlace');
        const stubEndVerif = sinon.stub(gameManager, 'isEndGame');
        gameManager.virtualPlayerCommand('room1');
        assert(placeStub.called);
        assert(stubEndVerif.called);
        stub.restore();
        placeStub.restore();
        stubTurn.restore();
        stubEndVerif.restore();
    });
    it('virtualPlayerCommand should call virtualPlayerPlace and virtualPlayerExchange if no placement found and level is expert', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        soloMatch.difficulty = LEVEL.Expert;
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const stub = sinon.stub(ScrabbleClassicSolo.prototype, 'commandVirtualPlayer').get(() => COMMANDS.Placer);
        const stubPlace = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerPlace').returns(false);
        const stubExchange = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerExchange');
        gameManager.virtualPlayerCommand('room1');
        soloMatch.difficulty = LEVEL.Beginner;
        assert(stubExchange.called);
        stub.restore();
        stubTurn.restore();
        stubPlace.restore();
        stubExchange.restore();
    });
    it('virtualPlayerCommand should call virtualPlayerExchange and not isEndGame when command is exchange', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const stub = sinon.stub(ScrabbleClassicSolo.prototype, 'commandVirtualPlayer').get(() => COMMANDS.Échanger);
        const stubExchange = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerExchange');
        const stubEndVerif = sinon.stub(gameManager, 'isEndGame');
        gameManager.virtualPlayerCommand('room1');
        assert(stubExchange.called);
        assert(stubEndVerif.notCalled);
        stubExchange.restore();
        stubEndVerif.restore();
        stub.restore();
        stubTurn.restore();
    });
    it('virtualPlayerCommand should call virtualPlayerPass and isEndGame when command is pass', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const stub = sinon.stub(ScrabbleClassicSolo.prototype, 'commandVirtualPlayer').get(() => COMMANDS.Passer);
        const passStub = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerPass');
        const stubEndVerif = sinon.stub(gameManager, 'isEndGame');
        gameManager.virtualPlayerCommand('room1');
        assert(passStub.called);
        assert(stubEndVerif.called);
        passStub.restore();
        stubEndVerif.restore();
        stub.restore();
        stubTurn.restore();
    });
    it('change-user-turn should call virtualPlayerPlay when game is solo', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const stubPlay = sinon.stub(gameManager, 'virtualPlayerPlay');
        hostSocket.emit('change-user-turn');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(stubPlay.called);
        stubPlay.restore();
        stubTurn.restore();
    });
    it('freeze-timer should send freeze-timer to the right room', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        const spy = sinon.spy(service['sio'], 'to');
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        hostSocket.emit('freeze-timer');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(match.room));
        stubTurn.restore();
    });
    it('quit-game should call leaveRoom with the socket id', async () => {
        await gameCreation('classic');
        const spy = sinon.spy(gameManager, 'leaveRoom');
        const hostID = hostSocket.id;
        hostSocket.emit('quit-game');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostID));
    });
    it('remove-arrow-and-letter should emit only to the socket id', async () => {
        const spy = sinon.spy(service['sio'], 'to');
        await gameCreation('classic');
        hostSocket.emit('remove-arrow-and-letter');
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.calledWith(hostSocket.id));
    });
    it('virtualPlayerPlay should call virtualPlayerPass after 20 seconds when command was unable to execute', async () => {
        const TWENTY_SECONDS = 20000;
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const mock = sinon.mock(gameManager);
        mock.expects('virtualPlayerCommand').returns(false);
        const clock = sinon.useFakeTimers();
        const passStub = sinon.stub(gameManager['virtualPlayer'], 'virtualPlayerPass');
        gameManager.virtualPlayerPlay(match.room);
        clock.tick(TWENTY_SECONDS);
        clock.restore();
        assert(passStub.called);
        passStub.restore();
        mock.restore();
        stubTurn.restore();
    });
    it('virtualPlayerPlay should call virtualPlayerCommand after 3 seconds and clear 20s time if success', async () => {
        const THREE_SECONDS = 3000;
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const mock = sinon.mock(gameManager);
        mock.expects('virtualPlayerCommand').returns(true);
        const clock = sinon.useFakeTimers();
        const spy = sinon.spy(global, 'clearInterval');
        gameManager.virtualPlayerPlay(match.room);
        clock.tick(THREE_SECONDS);
        clock.restore();
        assert(spy.called);
        mock.restore();
        stubTurn.restore();
    });
    it('virtualPlayerCommand should emit public goals and private after virtual player action when mode is LOG2990', async () => {
        const stubLog = sinon.stub(ScrabbleClassicSolo.prototype, 'logMode').get(() => true);
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, SOCKET_GAME_DELAY));
        const spy = sinon.spy(service['sio'], 'to');
        const stubCommand = sinon.stub(ScrabbleClassicSolo.prototype, 'commandVirtualPlayer').get(() => 'noCommand');
        const stubPublicGoals = sinon.stub(ScrabbleClassicSolo.prototype, 'getPublicGoals');
        const stubPrivateGoals = sinon.stub(ScrabbleClassicSolo.prototype, 'getPrivateGoal');
        gameManager.virtualPlayerCommand('room1');
        assert(stubPublicGoals.called);
        assert(stubPrivateGoals.called);
        assert(spy.called);
        stubPublicGoals.restore();
        stubPrivateGoals.restore();
        stubCommand.restore();
        stubLog.restore();
    });
    it('create-solo-game should call virtualPlayerPlay when first turn is virtual player', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => soloMatch.virtualPlayerName);
        const stubPlay = sinon.stub(gameManager, 'virtualPlayerPlay');
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(stubPlay.called);
        stubPlay.restore();
        stubTurn.restore();
    });
    it('refreshGame should be called when disconnectedSocket.oldSocketId has a socketId', async () => {
        service['disconnectedSocket'] = { oldSocketId: 'test', newSocketId: 'testNew' };
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => soloMatch.virtualPlayerName);
        const stubRefresh = sinon.stub(gameManager, 'refreshGame');
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(stubRefresh.called);
        stubRefresh.restore();
        stubTurn.restore();
    });
    it('create-solo-game should call setPrivateGoalsForPlayers and emit public goals and private when mode is LOG2990', async () => {
        const stubTurn = sinon.stub(ScrabbleClassicSolo.prototype, 'socketTurn').get(() => hostSocket.id);
        soloMatch.mode = 'LOG2990';
        const spy = sinon.spy(service['sio'], 'to');
        const stubSetGoals = sinon.stub(ScrabbleClassicSolo.prototype, 'setPrivateGoalsForPlayers');
        const stubPublicGoals = sinon.stub(ScrabbleClassicSolo.prototype, 'getPublicGoals');
        const stubPrivateGoals = sinon.stub(ScrabbleClassicSolo.prototype, 'getPrivateGoal');
        hostSocket.emit('create-solo-game', soloMatch);
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        assert(stubSetGoals.called);
        assert(stubPublicGoals.called);
        assert(stubPrivateGoals.called);
        stubTurn.restore();
        stubSetGoals.restore();
        stubPublicGoals.restore();
        stubPrivateGoals.restore();
    });
    it('join-game should call setPrivateGoalsForPlayers and emit public goals and private when mode is LOG2990', async () => {
        const spy = sinon.spy(service['sio'], 'to');
        const stubSetGoals = sinon.stub(ScrabbleClassic.prototype, 'setPrivateGoalsForPlayers');
        const stubPublicGoals = sinon.stub(ScrabbleClassic.prototype, 'getPublicGoals');
        const stubPrivateGoals = sinon.stub(ScrabbleClassic.prototype, 'getPrivateGoal');
        await gameCreation('LOG2990');
        assert(spy.called);
        assert(stubSetGoals.called);
        assert(stubPublicGoals.called);
        assert(stubPrivateGoals.called);
        stubSetGoals.restore();
        stubPublicGoals.restore();
        stubPrivateGoals.restore();
    });
    it('validate-created-words should emit public goals and private when mode is LOG2990', async () => {
        const lettersTest: Letter[] = [{ line: 2, column: 3, value: 'a' }];
        const stubValidate = sinon.stub(ScrabbleClassic.prototype, 'validateCalculateWordsPoints').returns(3);
        await gameCreation('LOG2990');
        const spy = sinon.spy(service['sio'], 'to');
        const stubPublicGoals = sinon.stub(ScrabbleClassic.prototype, 'getPublicGoals');
        const stubPrivateGoals = sinon.stub(ScrabbleClassic.prototype, 'getPrivateGoal');
        hostSocket.emit('validate-created-words', { letters: lettersTest, points: 50 });
        await new Promise((r) => setTimeout(r, RESPONSE_DELAY));
        assert(spy.called);
        assert(stubPublicGoals.called);
        assert(stubPrivateGoals.called);
        stubPublicGoals.restore();
        stubPrivateGoals.restore();
        stubValidate.restore();
    });
});
