import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';
import { JoindrePartieComponent } from './joindre-partie.component';
import { Game } from '@app/interfaces/game';
import { ActivatedRoute } from '@angular/router';
import { Dictionary } from '@app/interfaces/dictionary';

describe('JoindrePartieComponent', () => {
    let socketService: ChatSocketClientService;
    let socketHelper: SocketTestHelper;
    let component: JoindrePartieComponent;
    let fixture: ComponentFixture<JoindrePartieComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoindrePartieComponent],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } }],
        }).compileComponents();
    });

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        fixture = TestBed.createComponent(JoindrePartieComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.socketService = socketService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle username', () => {
        const myList = [true, true, true];
        const expected = [true, true, false];
        component.displayUsernameFormGame = myList;
        const mySwitch = 2;
        component.toggleUsernameForm(mySwitch);
        expect(component.displayUsernameFormGame).toEqual(expected);
    });

    it('should handle update-joinable-matches', () => {
        const myGame: Game = {
            usernameOne: 'username 1',
            usernameTwo: 'username 2',
            isJoined: false,
            time: 0,
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            hostID: '',
            mode: 'classic',
            type: 'solo',
        };
        const myGame2: Game = {
            usernameOne: 'username 1',
            usernameTwo: 'username 2',
            isJoined: false,
            time: 0,
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            hostID: '',
            mode: 'classic',
            type: 'solo',
        };
        const param = [myGame, myGame2];
        const spy = spyOn(component.gameList, 'push');
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('update-joinable-matches', param);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should send an event', () => {
        const myGame2: Game = {
            usernameOne: 'username 1',
            usernameTwo: 'username 2',
            isJoined: false,
            time: 0,
            dictionary: { fileName: 'dictionnary.json' } as Dictionary,
            hostID: '',
            mode: 'classic',
            type: 'solo',
        };
        const spy = spyOn(component.socketService, 'send');
        component.joinWaitingRoom(myGame2);
        expect(spy).toHaveBeenCalled();
    });

    it('should accept a string containing 0 special character as username', () => {
        const username = 'Zabi';
        const isValide = component.valideUsername(username);
        expect(isValide).toEqual(true);
    });

    it('should not accept a string containing special character as username', () => {
        const username = '@#$';
        const isValide = component.valideUsername(username);
        expect(isValide).toEqual(false);
    });

    it('should toggle username of random game when random placement button is clicked', () => {
        const games = [false, false, false];
        component.displayUsernameFormGame = games;
        component.joinRandomGame();
        expect(component.displayUsernameFormGame).toContain(true);
    });

    it('should close already opened gameToggles and open only one randomly when random placement button is clicked', () => {
        const games = [true, true, true];
        component.displayUsernameFormGame = games;
        component.joinRandomGame();
        expect(component.displayUsernameFormGame).toContain(false);
    });

    it('should close all already opened gameToggles', () => {
        const games = [true, true, true];
        component.displayUsernameFormGame = games;
        const gameWindows = [0, 1, 2];
        component.openedGameWindow = gameWindows;
        component.clearOpenedToggles();
        const expectedGameToggles = [false, false, false];
        expect(component.displayUsernameFormGame).toEqual(expectedGameToggles);
    });

    it('should close cancel toggle if cancel button is clicked', () => {
        const games = [true, true, true];
        const expected = [true, true, false];
        const indexCanceledToggle = 2;
        component.displayUsernameFormGame = games;
        component.cancelToggle(indexCanceledToggle);
        expect(component.displayUsernameFormGame).toEqual(expected);
    });

    it('should call connect if socket is not alive', () => {
        spyOn(component.socketService, 'isSocketAlive').and.returnValue(false);
        const spy = spyOn(component.socketService, 'connect');
        component.connect();
        expect(spy).toHaveBeenCalled();
    });

    it('should not call connect if socket is not alive', () => {
        spyOn(component.socketService, 'isSocketAlive').and.returnValue(true);
        const spy = spyOn(component.socketService, 'connect');
        component.connect();
        expect(spy).not.toHaveBeenCalled();
    });
});
