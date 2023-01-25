// eslint-disable-next-line import/no-deprecated
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { ConfirmationService } from '@app/services/confirmation.service';
import { Socket } from 'socket.io-client';
import { ConfirmationMessageComponent } from './confirmation-message.component';

describe('ConfirmationMessageComponent', () => {
    let component: ConfirmationMessageComponent;
    let fixture: ComponentFixture<ConfirmationMessageComponent>;
    const confirmationSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmationMessageComponent],
            providers: [
                { provide: MatDialogRef, useValue: confirmationSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: ConfirmationService, useValue: {} },
                { provide: ChatSocketClientService, useValue: {} },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        const socketHelper = new SocketTestHelper();
        const socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;

        fixture = TestBed.createComponent(ConfirmationMessageComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Clicking on the OK button should call the method onOk', async () => {
        fixture.detectChanges();
        const onOkSpy = spyOn(component, 'onOK');
        const okButton = fixture.debugElement.query(By.css('#ok'));
        okButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(onOkSpy).toHaveBeenCalled();
        });
    });

    it('Clicking on the Cancel button should call the method onCancel', async () => {
        fixture.detectChanges();
        const onCancelSpy = spyOn(component, 'onCancel');
        const cancelButton = fixture.debugElement.query(By.css('#cancel'));
        cancelButton.triggerEventHandler('click', null);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(onCancelSpy).toHaveBeenCalled();
        });
    });
    it('Calling method onOk() should call confirmationDialog with the parameter true', () => {
        component.onOK();
        expect(confirmationSpy.close).toHaveBeenCalled();
    });
    it('Calling method onCancel() should call confirmationDialog with the parameter true', () => {
        component.onCancel();
        expect(confirmationSpy.close).toHaveBeenCalled();
    });
});
