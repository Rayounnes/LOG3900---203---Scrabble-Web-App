import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingRoomPageComponent } from './waiting-room-page.component';
import { HttpClientModule } from '@angular/common/http';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';
// eslint-disable-next-line no-restricted-imports
import { JoindrePartieComponent } from '../joindre-partie/joindre-partie.component';
import { ActivatedRoute } from '@angular/router';

const WAITING_DELAY = 3000;

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'joindre-partie', component: JoindrePartieComponent }]), HttpClientModule],
            declarations: [WaitingRoomPageComponent],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } }],
        }).compileComponents();
    });

    beforeEach(() => {
        const socketHelper = new SocketTestHelper();
        const socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;

        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.socketService = socketService;
    });

    it('should call connect', () => {
        const spy = spyOn(component, 'connect');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should not call connect if socket is not alive', () => {
        spyOn(component.socketService, 'isSocketAlive').and.returnValue(true);
        const spy = spyOn(component.socketService, 'connect');
        component.connect();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call configureBaseSocketFeatures', () => {
        const spy = spyOn(component, 'configureBaseSocketFeatures');
        component.connect();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle create-game event', () => {
        const username = 'myusername';
        component.isHost = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('create-game', username);
        expect(component.isHost).toEqual(true);
    });

    it('should handle waiting-room-second-player event', () => {
        const username = 'myusername';
        component.isJoinedPlayer = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('waiting-room-second-player', username);
        expect(component.isJoinedPlayer).toEqual(true);
    });

    it('should handle add-second-player-waiting-room event', () => {
        component.hostUsername = 'myName';
        const parameter = {
            usernameTwo: 'username',
            usernameOne: 'IAmHost',
        };
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('add-second-player-waiting-room', parameter);
        expect(component.hostUsername).toEqual(parameter.usernameOne);
    });

    it('should handle kick-user event', fakeAsync((): void => {
        component.configureBaseSocketFeatures();
        const spy = spyOn(component.router, 'navigate');
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('kick-user');
        tick(WAITING_DELAY);
        expect(spy).toHaveBeenCalled();
    }));

    it('should handle joined-user-left event', () => {
        component.userLeft = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('joined-user-left');
        expect(component.userLeft).toEqual(true);
    });

    it('should handle joined-user-left event', () => {
        component.userLeft = false;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('joined-user-left');
        expect(component.userLeft).toEqual(true);
    });

    it('should handle join-game event', () => {
        const spy = spyOn(component.router, 'navigate');
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('join-game');
        expect(spy).toHaveBeenCalled();
    });

    it('confirmuser() sends an event to the server', () => {
        const spy = spyOn(component.socketService, 'send');
        component.confirmUser();
        expect(spy).toHaveBeenCalled();
    });

    it('cancelWaitingJoinedUser() sends an event to the server', () => {
        const spy = spyOn(component.socketService, 'send');
        component.cancelWaitingJoinedUser();
        expect(spy).toHaveBeenCalled();
    });

    it('cancelMatch() sends an event to the server', () => {
        const spy = spyOn(component.socketService, 'send');
        component.cancelMatch();
        expect(spy).toHaveBeenCalled();
    });

    it('kickUser() sends an event to the server', () => {
        const spy = spyOn(component.socketService, 'send');
        component.kickUser();
        expect(spy).toHaveBeenCalled();
    });
});
