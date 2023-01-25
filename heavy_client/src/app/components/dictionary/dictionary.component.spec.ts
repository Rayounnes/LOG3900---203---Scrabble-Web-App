/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Socket } from 'socket.io-client';

import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryComponent } from './dictionary.component';

describe('DictionaryComponent', () => {
    let component: DictionaryComponent;
    let fixture: ComponentFixture<DictionaryComponent>;
    const confirmationSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DictionaryComponent],
            providers: [
                { provide: MatDialogRef, useValue: confirmationSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        const socketHelper = new SocketTestHelper();
        const socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;

        fixture = TestBed.createComponent(DictionaryComponent);
        component = fixture.componentInstance;
        component.socketService = socketService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onTabChange Dictionary should change dictionary selected', () => {
        component.dictionaries[9] = { title: 'Anglais' } as Dictionary;
        const expectedRes: Dictionary = { title: 'Anglais' } as Dictionary;
        component.selectedDictionary = { title: 'Francais' } as Dictionary;
        const dict = { index: 9 } as any;
        component.onChangeTab(dict);
        expect(component.selectedDictionary).toEqual(expectedRes);
    });

    it('Calling method onCancel() should call confirmationDialog with the parameter true', () => {
        component.onCancel();
        expect(confirmationSpy.close).toHaveBeenCalled();
    });

    it('Calling method onnOK() should send an event', () => {
        const spy = spyOn(component.socketService, 'send');
        component.onOK();
        expect(spy).toHaveBeenCalled();
    });

    it('Calling method onnOK() should send an event', () => {
        const dictArr = [{ title: 'Francais' } as Dictionary];
        component.updateDictionaries(dictArr);
        expect(component.dicts).toEqual(dictArr);
    });
});
