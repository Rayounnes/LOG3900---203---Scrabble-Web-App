/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TopScore } from '@app/interfaces/top-scores';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';
import { Socket } from 'socket.io-client';
import { InformationPanelComponent } from './information-panel.component';

describe('ChatBoxComponent', () => {
    let socketService: ChatSocketClientService;
    let httpMock: HttpTestingController;
    let baseUrl: string;
    let socketHelper: SocketTestHelper;
    let component: InformationPanelComponent;
    let communicationService: CommunicationService;
    let fixture: ComponentFixture<InformationPanelComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        communicationService = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = communicationService['baseUrl'];
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        fixture = TestBed.createComponent(InformationPanelComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call connect', () => {
        const myComponent: InformationPanelComponent = new InformationPanelComponent(socketService, communicationService);
        const spy = spyOn(myComponent, 'connect');
        myComponent.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should call configureBaseSocketFeatures', () => {
        const spy = spyOn(component, 'configureBaseSocketFeatures');
        component.connect();
        expect(spy).toHaveBeenCalled();
    });

    // it('intervalHandler should call clear interval when the clock reaches 0', () => {
    //     component.clock = 1;
    //     const spy = spyOn(global, 'clearInterval');
    //     component.intervalHandler();
    //     expect(spy).toHaveBeenCalledWith(component.timer);
    // });

    it('intervalHandler should send an event when the clock reaches 0', () => {
        component.clock = 1;
        const spy = spyOn(component.socketService, 'send');
        component.intervalHandler();
        expect(spy).toHaveBeenCalled();
    });

    it('saveClockBeforeRefresh should call setItem from sessionStorage if game is not abandonned', () => {
        component.isAbandon = false;
        const spy = spyOn(sessionStorage, 'setItem');
        component.saveClockBeforeRefresh();
        expect(spy).toHaveBeenCalled();
    });

    it('saveClockBeforeRefresh should call setItem from sessionStorage if game is not abandonned', () => {
        component.isAbandon = true;
        component.isGameFinished = true;
        const spy = spyOn(sessionStorage, 'clear');
        component.saveClockBeforeRefresh();
        expect(spy).toHaveBeenCalled();
    });

    it('isRefresh should be set to true on intialisation if session storage has an item clock', () => {
        component.isRefresh = false;
        spyOn(sessionStorage, 'getItem').and.returnValue('string');
        component.ngOnInit();
        expect(component.isRefresh).toEqual(true);
    });

    it('isRefresh should not be set to true on intialisation if session storage does not have an item clock', () => {
        component.isRefresh = false;
        spyOn(sessionStorage, 'getItem').and.returnValue(null);
        component.ngOnInit();
        expect(component.isRefresh).toEqual(false);
    });

    it('on refresh-user-turn event isPlayersTurn should be set to true if socket id is equal to socketTurnId', () => {
        const playerTurnId = component.socketId;
        component.isPlayersTurn = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('refresh-user-turn', playerTurnId);
        expect(component.isPlayersTurn).toEqual(true);
    });

    // it('should clear interval on freeze-timer', () => {
    //     const spy = spyOn(global, 'clearInterval');
    //     component.configureBaseSocketFeatures();
    //     socketHelper.peerSideEmit('freeze-timer');
    //     expect(spy).toHaveBeenCalledWith(component.timer);
    // });

    // it('should clear interval on endGame', () => {
    //     const spy = spyOn(global, 'clearInterval');
    //     component.configureBaseSocketFeatures();
    //     socketHelper.peerSideEmit('end-game');
    //     expect(spy).toHaveBeenCalledWith(component.timer);
    // });

    it('should handle send info to panel from the server', () => {
        component.player.score = 0;
        component.opponent.score = 0;

        const argument = {
            usernameTwo: 'player2',
            usernameOne: 'player',
        };
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('send-info-to-panel', argument);
        expect(component.player.username).toEqual(argument.usernameOne);
    });

    it('update-player-score from server', () => {
        component.player.score = 0;
        component.opponent.score = 0;

        const argument = {
            points: 8,
            playerScored: true,
        };
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('update-player-score', argument);
        expect(component.player.score).toEqual(argument.points);
    });

    it('should change isPlayerTurn to true if socketTurn and SocketId are equal', () => {
        component.isPlayersTurn = false;
        component.socketService.socket.id = '123';
        const playerTurnId = '123';

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('user-turn', playerTurnId);
        expect(component.isPlayersTurn).toEqual(true);
    });

    it('user-turn event should set isRefresh to false if its true', () => {
        const playerTurnId = '123';
        component.isRefresh = true;

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('user-turn', playerTurnId);
        expect(component.isRefresh).toEqual(false);
    });

    it('updating opponent score if the playerScored is set to false', () => {
        component.player.score = 0;
        component.opponent.score = 0;

        const argument = {
            points: 8,
            playerScored: false,
        };
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('update-player-score', argument);
        expect(component.opponent.score).toEqual(argument.points);
    });

    it('should change isPlayerTurn to false if socketTurn and SocketId are not equal', () => {
        component.isPlayersTurn = false;
        component.socketService.socket.id = '123';
        const playerTurnId = '13';

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('user-turn', playerTurnId);
        expect(component.isPlayersTurn).not.toEqual(true);
    });
    it('should handle abandon game', () => {
        component.isAbandon = false;

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('abandon-game');
        expect(component.isAbandon).toEqual(true);
    });

    it('should handle update reserve', () => {
        const reserveLength = 9;
        component.reserveTilesLeft = 50;

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('update-reserve', reserveLength);
        expect(component.reserveTilesLeft).toEqual(reserveLength);
    });
    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const firstScore: TopScore = {
            playerName: 'test',
            score: 0,
        };
        communicationService.bestScoresPost(firstScore, 'Classic').subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/bestScore/Classic/send`);
        component.addScore();
        expect(req.request.method).toBe('POST');
    });
    it('should send a POST request with the game info', () => {
        const gameInfo: GameHistory = {
            playerName: 'Nabil',
            opponentPlayerName: 'Marc',
            mode: 'Classique',
            date: '28/03/2022, 15:05:23',
            finalScore: 100,
            oponnentFinalScore: 50,
            duration: '20min 15sec',
            abandoned: '',
        };
        component.isHost = true;
        communicationService.gameHistoryPost(gameInfo).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/gameHistory/send`);
        component.addGameToHistory();
        expect(req.request.method).toBe('POST');
    });
    it('getDate should be called on intialisation', () => {
        component.dateAtStart = '';
        component.isRefresh = false;
        spyOn(sessionStorage, 'getItem').and.returnValue(null);
        const spy = spyOn(component, 'getDate').and.returnValue('11/04/2022, 00:12:11');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
        expect(component.dateAtStart).toEqual('11/04/2022, 00:12:11');
    });
    it('getGameDuration should return the duration of the game', () => {
        component.gameDuration = 60;
        const lengthOfGame = component.getGameDuration();
        const expectedGameDuration = '1min0sec';
        expect(lengthOfGame).toEqual(expectedGameDuration);
    });
    it('should call addGameToHistory on end game', () => {
        const spy = spyOn(component, 'addGameToHistory');
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('end-game', false);
        expect(spy).toHaveBeenCalled();
    });
    it('getDate should return the date and time of the start of the game', () => {
        const date = component.getDate();
        expect(date).not.toEqual('');
    });
    it('abandoned message should be added in the game history if a solo game is abandoned', () => {
        component.isAbandon = true;
        component.game.type = 'solo';
        const expectedMessage = '***Cette partie a été abandonnée.';
        component.addGameToHistory();
        expect(component.msgAbandoned).toEqual(expectedMessage);
    });
    it('should not send a POST request with game info when the player is not the host', () => {
        const spy = spyOn(communicationService, 'gameHistoryPost');
        component.isHost = false;
        component.addGameToHistory();
        expect(spy).not.toHaveBeenCalled();
    });
});
