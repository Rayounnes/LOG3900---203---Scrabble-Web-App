import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SurrenderGameComponent } from './surrender-game.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('SurrenderGameComponent', () => {
    let socketHelper: SocketTestHelper;
    let socketService: ChatSocketClientService;
    let component: SurrenderGameComponent;
    let fixture: ComponentFixture<SurrenderGameComponent>;
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
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([]), HttpClientModule, MatDialogModule, BrowserAnimationsModule],
            declarations: [SurrenderGameComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: mockDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;

        fixture = TestBed.createComponent(SurrenderGameComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('popUp should call matDialog open', async () => {
        mockDialog.open.and.returnValue(mockDialogAfterClose);
        mockDialogAfterClose.afterClosed.and.returnValue(of());
        mockDialogSubscribe.subscribe.and.returnValue(of());
        component.popUp();
    });

    it('endGame should make isGameFinished true', () => {
        component.isGameFinished = false;

        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('end-game');
        expect(component.isGameFinished).toEqual(true);
    });

    it('leaveGame should navigate to main page', (): void => {
        component.configureBaseSocketFeatures();
        const spy = spyOn(component.router, 'navigate');
        component.leaveGame();
        expect(spy).toHaveBeenCalledWith(['/']);
    });
});
