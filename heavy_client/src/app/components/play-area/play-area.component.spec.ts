/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Letter } from '@app/interfaces/letter';
import { Placement } from '@app/interfaces/placement';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';
import SpyObj = jasmine.SpyObj;
import { CommunicationService } from '@app/services/communication.service';
import { ActivatedRoute } from '@angular/router';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let socketService: ChatSocketClientService;
    let socketHelper: SocketTestHelper;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost'], ['gameMode']);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should handle user-turn', () => {
        component.socketTurn = '33';
        const socketId = '123';
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('user-turn', socketId);
        expect(component.socketTurn).toEqual(socketId);
    });

    it('should handle the private-goal-opponent', () => {
        const goal = { id: 1, name: 'objectif 1', points: 40, isCompleted: false, isVerified: false, state: '' };
        component.privateGoalOpponent = goal;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('private-goal-opponent', goal);
        expect(component.privateGoalOpponent).toEqual(goal);
    });

    it('should handle the user-turn', () => {
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('user-turn', 'player1');
        expect(component.socketTurn).toEqual('player1');
    });

    it('should handle the private-goal-after', () => {
        const goal = { id: 1, name: 'objectif 1', points: 40, isCompleted: false, isVerified: false, state: '' };
        component.privateGoal = goal;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('private-goal-after', goal);
        expect(component.privateGoal).toEqual(goal);
    });

    it('should handle the private-goal', () => {
        const goal = { id: 1, name: 'objectif 1', points: 40, isCompleted: false, isVerified: false, state: '' };
        component.privateGoal = goal;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('private-goal', goal);
        expect(component.privateGoal).toEqual(goal);
    });

    it('should handle the public-goals-after', () => {
        const goal = [{ id: 1, name: 'objectif 1', points: 40, isCompleted: false, isVerified: false, state: '' }];
        component.publicGoals = goal;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('public-goals-after', goal);
        expect(component.publicGoals).toEqual(goal);
    });

    it('should handle the public-goals', () => {
        const goal = [{ id: 1, name: 'objectif 1', points: 40, isCompleted: false, isVerified: false, state: '' }];
        component.publicGoals = goal;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('public-goals', goal);
        expect(component.publicGoals).toEqual(goal);
    });
    it('verify-place-message set commandSent to false if letters of placedWord is of type string', () => {
        component.commandSent = true;
        const placedWord = {
            letters: 'This is a string' as string | Letter[],
            points: 8,
            command: 'string',
        } as Placement;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('verify-place-message', placedWord);
        expect(component.commandSent).toEqual(false);
    });

    it('verify-place-message set commandSent to true if letters of placedWord is not of type string', () => {
        component.commandSent = false;
        const placedWord = {
            letters: [{ line: 2, column: 3, value: 'a' }],
            points: 8,
            command: 'string',
        } as Placement;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('verify-place-message', placedWord);
        expect(component.commandSent).toEqual(true);
    });

    it('validate-created-words set commandSent to false after three seconds if points of placedWord is 0', fakeAsync(() => {
        component.commandSent = true;
        const placedWord = {
            letters: [{ line: 2, column: 3, value: 'a' }],
            points: 0,
            command: 'string',
        } as Placement;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('validate-created-words', placedWord);
        expect(component.commandSent).toEqual(true);
        tick(3000);
        expect(component.commandSent).toEqual(false);
    }));

    it('validate-created-words set commandSent to false after three seconds if points of placedWord is not 0', fakeAsync(() => {
        component.commandSent = true;
        const placedWord = {
            letters: [{ line: 2, column: 3, value: 'a' }],
            points: 9,
            command: 'string',
        } as Placement;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('validate-created-words', placedWord);
        expect(component.commandSent).toEqual(false);
    }));

    it('end-game should set commandSent and isEndGame to true', () => {
        component.commandSent = false;
        component.commandSent = false;

        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('end-game');
        expect(component.commandSent).toEqual(true);
        expect(component.commandSent).toEqual(true);
    });

    it('remove-arrow-and-letter should callremoveLetterAndArrow()', () => {
        const spy = spyOn(component, 'removeLetterAndArrow');
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('remove-arrow-and-letter');
        expect(spy).toHaveBeenCalled();
    });

    it(' enLargeSize() should increment the words size', () => {
        const currentSize = component.size;
        component.enlargeSize();
        const newSize = component.size;
        expect(newSize).toBe(currentSize + 1);
    });
    it(' reduceSize() should decrement the words size', () => {
        const currentSize = component.size;
        component.reduceSize();
        const constnewSize = component.size;
        const sizeDifference = constnewSize - currentSize;
        const expectedSize = -1;
        expect(sizeDifference).toBe(expectedSize);
    });

    it(' enLargeSize() should not increment if the word size exceeds 28px', () => {
        for (let i = 0; i < 20; i++) {
            component.enlargeSize();
        }
        const newSize = component.size;
        const expectedSize = 28;
        expect(newSize).toBe(expectedSize);
    });

    it(' enLargeSize() should not decrement if the word size is below 23px (the current size is 25)', () => {
        for (let i = 0; i < 5; i++) {
            component.reduceSize();
        }
        const newSize = component.size;
        const expectedSize = 23;
        expect(newSize).toBe(expectedSize);
    });

    it(' passTurn() should send an event', () => {
        const spy = spyOn(component.socketService, 'send');
        component.passTurn();
        expect(spy).toHaveBeenCalled();
    });

    it(' mouseHitDetect should call detectOnCanvas', () => {
        // eslint-disable-next-line dot-notation
        component['gridService'].board.wordStarted = false;
        component.socketTurn = component.socketService.socketId;
        component.isEndGame = false;
        const evt = new MouseEvent('click');
        const spy = spyOn(component.mouse, 'detectOnCanvas');
        component.mouseHitDetect(evt);
        expect(spy).toHaveBeenCalled();
    });
    it(' mouseHitDetect should not call detectOnCanvas if the word has started', () => {
        // eslint-disable-next-line dot-notation
        component['gridService'].board.wordStarted = true;
        component.socketTurn = component.socketService.socketId;
        component.isEndGame = false;
        const evt = new MouseEvent('click');
        const spy = spyOn(component.mouse, 'detectOnCanvas');
        component.mouseHitDetect(evt);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' buttonPlayPressed should call makeRackTilesIn', () => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component.chevaletService, 'makerackTilesIn');
        component.buttonPlayPressed();
        expect(spy).toHaveBeenCalled();
    });

    it(' removeLetterAndArrow should call makeRackTilesIn', () => {
        const spy = spyOn(component.chevaletService, 'makerackTilesIn');
        component.removeLetterAndArrow();
        expect(spy).toHaveBeenCalled();
    });

    it(' clickDetect should call removeAllLetters', () => {
        // eslint-disable-next-line dot-notation
        const event = jasmine.createSpyObj('MouseEvent', ['target']);
        event.target = jasmine.createSpyObj('EventTarget', ['id']);
        event.target.id = 'notcanvas';
        const spy = spyOn(component.keyboard, 'removeAllLetters');
        component.clickDetect(event);
        expect(spy).toHaveBeenCalled();
    });
    it(' clickDetect should not call removeAllLetters if the target id is canvas', () => {
        // eslint-disable-next-line dot-notation
        const event = jasmine.createSpyObj('MouseEvent', ['target']);
        event.target = jasmine.createSpyObj('EventTarget', ['id']);
        event.target.id = 'canvas';
        const spy = spyOn(component.keyboard, 'removeAllLetters');
        component.clickDetect(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(' buttonDetect should call removeLetterOnRack if the key is valid', () => {
        const event = jasmine.createSpyObj('MouseEvent', ['target']);
        event.target = jasmine.createSpyObj('KeyboardTarget', ['key']);
        event.key = 'Shift';
        component.buttonDetect(event);
        expect(true).toBe(true);
    });

    it(' buttonDetect should not call removeLetterOnRack if the key is not valid', () => {
        const event = jasmine.createSpyObj('MouseEvent', ['target']);
        event.target = jasmine.createSpyObj('KeyboardTarget', ['key']);
        event.key = 'a';
        spyOn(component.keyboard, 'importantKey').and.stub();
        spyOn(component.chevaletService, 'removeLetterOnRack').and.stub();
        const spy = spyOn(component.keyboard, 'placerOneLetter');

        component.buttonDetect(event);
        expect(spy).toHaveBeenCalled();
    });
});
