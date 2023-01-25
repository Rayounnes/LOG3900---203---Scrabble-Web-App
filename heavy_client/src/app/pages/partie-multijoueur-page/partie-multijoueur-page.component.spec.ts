import { PartieMultijoueurPageComponent } from './partie-multijoueur-page.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
// eslint-disable-next-line no-restricted-imports
import { WaitingRoomPageComponent } from '../waiting-room-page/waiting-room-page.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';

describe('PartieMultijoueurPageComponent', () => {
    let socketService: ChatSocketClientService;
    let socketHelper: SocketTestHelper;
    let component: PartieMultijoueurPageComponent;
    let fixture: ComponentFixture<PartieMultijoueurPageComponent>;

    const communicationMock = {
        getDictionaries: () => {
            return of([{ title: 'Francais' } as Dictionary]);
        },
    };

    const mockDialogAfterClose = {
        afterClosed: jasmine.createSpy('afterClosed'),
    };
    const mockDialog = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: jasmine.createSpy('open'),
    };
    const mockDialogSubscribe = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        subscribe: jasmine.createSpy('subscribe'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([{ path: 'waiting-room', component: WaitingRoomPageComponent }]),
                HttpClientModule,
                MatDialogModule,
            ],
            declarations: [PartieMultijoueurPageComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: mockDialog },
                { provide: CommunicationService, useValue: communicationMock },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;

        fixture = TestBed.createComponent(PartieMultijoueurPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.socketService = socketService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send an event', () => {
        const spy = spyOn(component.socketService, 'send');
        component.goToNextPage();
        expect(spy).toHaveBeenCalled();
    });

    it('should not accept a string containing special character as username', () => {
        const username = '#$@df';
        const isValide = component.valideUsername(username);
        expect(isValide).toEqual(false);
    });

    it('should accept a string containing 0 special character as username', () => {
        const username = 'Zabi';
        const isValide = component.valideUsername(username);
        expect(isValide).toEqual(true);
    });

    it('should navigate to waiting room', () => {
        const spy = spyOn(component.router, 'navigate');
        component.goToNextPage();
        expect(spy).toHaveBeenCalled();
    });

    it('should set time at 30sec if user enters a time lower than 30sec', () => {
        component.game.time = 3;
        component.goToNextPage();
        const expectedTurnTime = 30;
        expect(component.game.time).toEqual(expectedTurnTime);
    });

    it('should set time at 300sec if user enters a time higher than 300sec', () => {
        component.game.time = 400;
        component.goToNextPage();
        const expectedTurnTime = 300;
        expect(component.game.time).toEqual(expectedTurnTime);
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

    it('dictionary selected should select dictionary', () => {
        component.game.dictionary = {} as Dictionary;
        const dict = { title: 'Francais' } as Dictionary;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('dictionary-selected', dict);
        expect(component.game.dictionary).toEqual(dict);
    });

    it('sendInfo Should go to next page', () => {
        component.game.dictionary.title = 'Francais';
        component.game.usernameOne = 'zabi';
        const spy = spyOn(component, 'goToNextPage');
        component.sendInfo();
        expect(spy).toHaveBeenCalled();
    });

    it('sendInfo delete dictionary if they dont match', () => {
        component.game.dictionary.title = 'Anglais';
        component.game.usernameOne = 'zabi';
        component.sendInfo();
        expect(component.deletedDictionary).toEqual(component.game.dictionary);
    });

    it('popUp should call after close', async () => {
        mockDialog.open.and.returnValue(mockDialogAfterClose);
        mockDialogAfterClose.afterClosed.and.returnValue(of());
        mockDialogSubscribe.subscribe.and.returnValue(of());
        component.popUp();
    });
});
