import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChevaletComponent } from './chevalet.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';

describe('ChevaletComponent', () => {
    let component: ChevaletComponent;
    let socketService: ChatSocketClientService;
    let socketHelper: SocketTestHelper;
    let fixture: ComponentFixture<ChevaletComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChevaletComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        fixture = TestBed.createComponent(ChevaletComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        component.socketService = socketService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('on draw-letters-rack event should should call updateRack', () => {
        const spy = spyOn(component.chevaletService, 'updateRack').and.stub();
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('draw-letters-rack', ['O', 'K']);
        expect(spy).toHaveBeenCalled();
    });

    it('buttonDetect should call moveLetter', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['target']);
        event.target = jasmine.createSpyObj('EventTarget', ['className']);
        event.target.className = 'mat-typography vsc-initialized';
        component.buttonDetect(event);
        const spy = spyOn(component.chevaletService, 'moveLetter').and.stub();
        expect(spy).not.toHaveBeenCalled();
    });

    it('clickDetect should call deselectAllLetters', () => {
        const event = jasmine.createSpyObj('ClickDetectEvent', ['target']);
        event.target = jasmine.createSpyObj('EventTarget', ['id']);
        event.target.id = 'not-canvas';
        const spy = spyOn(component.chevaletService, 'deselectAllLetters').and.stub();
        component.clickDetect(event);
        expect(spy).toHaveBeenCalled();
    });

    it('buttonDetect should not call moveLetter', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['target', 'key']);
        event.key = 'a';
        event.target = jasmine.createSpyObj('EventTarget', ['type']);
        event.target.type = 'notText';
        component.buttonDetect(event);
        const spy = spyOn(component.chevaletService, 'selectLetterKeyboard');
        expect(spy).not.toHaveBeenCalled();
    });

    it('scroll should call moveLetterLeft', () => {
        const event = jasmine.createSpyObj('MouseWheel', ['target', 'wheelDelta']);
        event.wheelDelta = 1;
        event.target = jasmine.createSpyObj('EventTarget', ['type']);
        event.target.type = 'notText';
        spyOn(component.chevaletService, 'selectLetter').and.stub();
        spyOn(component.chevaletService, 'moveOnRack').and.stub();
        spyOn(component.chevaletService, 'findManipulateLetter').and.stub();
        spyOn(component.chevaletService, 'updateRack').and.stub();
        spyOn(component.chevaletService, 'rackArrayLetters').and.stub();
        const spy = spyOn(component.chevaletService, 'moveLetterLeft');
        component.scroll(event);
        expect(spy).toHaveBeenCalled();
    });

    it('scroll should call moveLetterRight', () => {
        const event = jasmine.createSpyObj('MouseWheel', ['target', 'wheelDelta']);
        event.wheelDelta = -1;
        event.target = jasmine.createSpyObj('EventTarget', ['type']);
        event.target.type = 'notText';
        spyOn(component.chevaletService, 'selectLetter').and.stub();
        spyOn(component.chevaletService, 'moveOnRack').and.stub();
        spyOn(component.chevaletService, 'findManipulateLetter').and.stub();
        spyOn(component.chevaletService, 'updateRack').and.stub();
        spyOn(component.chevaletService, 'rackArrayLetters').and.stub();
        const spy = spyOn(component.chevaletService, 'moveLetterRight');
        component.scroll(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should set socketTurn of component to socketTurn passed in parameter on user-turn', () => {
        component.socketTurn = 'username1';
        const expected = 'username2';
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('user-turn', expected);
        expect(component.socketTurn).toEqual(expected);
    });

    it('should set reserveTilesLeft of component to socketTurn passed in parameter on update-reserve', () => {
        component.reserveTilesLeft = 88;
        const expected = 4;
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('update-reserve', expected);
        expect(component.reserveTilesLeft).toEqual(expected);
    });

    it('should set isEndGame to true on end-game event', () => {
        component.isEndGame = false;
        const expected = true;
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('end-game', expected);
        expect(component.isEndGame).toBeTruthy();
    });

    it('cancel should call deselectAllLetters', () => {
        const spy = spyOn(component.chevaletService, 'deselectAllLetters').and.stub();
        component.cancel();
        expect(spy).toHaveBeenCalled();
    });
    it('exchange should call deselectAllLetters', () => {
        const spy = spyOn(component.chevaletService, 'deselectAllLetters').and.stub();
        component.exchange();
        expect(spy).toHaveBeenCalled();
    });
    it('rightMouseHitDetect should call changeRackTile', () => {
        component.socketTurn = component.socketService.socketId;
        component.isEndGame = false;
        const mockClick = new MouseEvent('click');
        const spy = spyOn(component.chevaletService, 'changeRackTile').and.stub();
        component.rightMouseHitDetect(mockClick);
        expect(spy).toHaveBeenCalled();
    });
    it('rightMouseHitDetect should not call changeRackTile if isEndGame is true', () => {
        component.socketTurn = component.socketService.socketId;
        component.isEndGame = true;
        const mockClick = new MouseEvent('click');
        const spy = spyOn(component.chevaletService, 'changeRackTile').and.stub();
        component.rightMouseHitDetect(mockClick);
        expect(spy).not.toHaveBeenCalled();
    });
    it('leftMouseHitDetect should call changeRackTile', () => {
        const mockClick = new MouseEvent('click');
        const spy = spyOn(component.chevaletService, 'changeRackTile').and.stub();
        component.leftMouseHitDetect(mockClick);
        expect(spy).toHaveBeenCalled();
    });
});
