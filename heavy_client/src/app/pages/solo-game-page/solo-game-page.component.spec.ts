import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Dictionary } from '@app/interfaces/dictionary';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { LEVEL } from 'src/constants/virtual-player-constants';
import { BEGGINERS_NAMES, EXPERTS_NAMES, VPlayerName } from 'src/constants/virtual-player-names';
// eslint-disable-next-line no-restricted-imports
import { GamePageComponent } from '../game-page/game-page.component';
import { SoloGamePageComponent } from './solo-game-page.component';

describe('SoloGamePageComponent', () => {
    let component: SoloGamePageComponent;
    let fixture: ComponentFixture<SoloGamePageComponent>;
    let communicationService: CommunicationService;

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
            imports: [RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }]), HttpClientTestingModule, MatDialogModule],
            declarations: [SoloGamePageComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: mockDialog },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        communicationService = TestBed.inject(CommunicationService);
        fixture = TestBed.createComponent(SoloGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const socketHelper = new SocketTestHelper();
        const socketService = new ChatSocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        component.socketService = socketService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not accept a string containing special character as username', () => {
        const username = 'Nabil!?';
        const isValid = component.valideUsername(username);
        expect(isValid).toEqual(false);
    });

    it('should accept a string containing 0 special character as username', () => {
        const username = 'Nabil';
        const isValid = component.valideUsername(username);
        expect(isValid).toEqual(true);
    });

    it('should not accept a string containing 0 character as username', () => {
        const username = '';
        const isNotValid = component.validateIfEmpty(username);
        expect(isNotValid).toEqual(false);
    });

    it('nameModifDetection should return true if a name is entered by the user', () => {
        component.changeNameCount = 1;
        const isTrue = component.nameModifDetection();
        expect(isTrue).toEqual(true);
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

    it('should call getExpertLevel on init', () => {
        const spy = spyOn(component, 'getExpertLevel');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should get beginner virtual players names', async () => {
        const response: VPlayerName[] = [];
        let expectedNames: string[] = [];
        spyOn(communicationService, 'virtualPlayerNamesGet').and.returnValue(of(response));
        expectedNames = response.map((vPlayer) => vPlayer.name);
        component.getBeginnerLevel();
        fixture.detectChanges();
        expect(component.dataSourceBeginnerVPlayerNames).toEqual(expectedNames);
    });

    it('should get expert virtual players names', async () => {
        const response: VPlayerName[] = [];
        let expectedNames: string[] = [];
        spyOn(communicationService, 'virtualPlayerNamesGet').and.returnValue(of(response));
        expectedNames = response.map((vPlayer) => vPlayer.name);
        component.getExpertLevel();
        fixture.detectChanges();
        expect(component.dataSourceExpertVPlayerName).toEqual(expectedNames);
    });

    it('should get all dictionaries', async () => {
        component.dictionaries = [];
        const response: Dictionary[] = [];
        spyOn(communicationService, 'getDictionaries').and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.dictionaries).toEqual(response);
    });

    it('should generate random beginner virtual player name', () => {
        component.game.usernameOne = 'Nabs';
        component.dataSourceBeginnerVPlayerNames = ['Marc'];
        component.setVirtualPlayerName(LEVEL.Beginner);
        const name = component.game.virtualPlayerName;
        expect(BEGGINERS_NAMES).toContain(name);
    });

    it('should generate random expert virtual player name', () => {
        component.game.usernameOne = 'Nabs';
        component.dataSourceExpertVPlayerName = ['Messi'];
        component.setVirtualPlayerName(LEVEL.Expert);
        const name = component.game.virtualPlayerName;
        expect(EXPERTS_NAMES).toContain(name);
    });

    it('startGame should call goToNextGame if dictionary titles match', () => {
        component.game.usernameOne = 'Zabi';
        component.game.dictionary.title = 'Anglais';
        const response: Dictionary[] = [{ title: 'Anglais', description: '', words: [''], fileName: '' }];
        spyOn(communicationService, 'getDictionaries').and.returnValue(of(response));
        const spy = spyOn(component, 'goToNextPage');
        component.startGame();
        expect(spy).toHaveBeenCalled();
    });

    it("startGame should delete dictionary if titles don't match", () => {
        component.game.usernameOne = 'Zabi';
        component.game.dictionary.title = 'Anglais';
        const response: Dictionary[] = [{ title: 'Français', description: '', words: [''], fileName: '' }];
        spyOn(communicationService, 'getDictionaries').and.returnValue(of(response));
        component.startGame();
        expect(component.deletedDictionary).toEqual(response[0]);
    });

    it('dictionary selected should select dictionary', () => {
        component.game.dictionary = {} as Dictionary;
        const dict = { title: 'Francais' } as Dictionary;
        component.configureBaseSocketFeatures();
        (component.socketService.socket as unknown as SocketTestHelper).peerSideEmit('dictionary-selected', dict);
        expect(component.game.dictionary).toEqual(dict);
    });

    it('popUp should call after close', async () => {
        mockDialog.open.and.returnValue(mockDialogAfterClose);
        mockDialogAfterClose.afterClosed.and.returnValue(of());
        mockDialogSubscribe.subscribe.and.returnValue(of());
        component.popUp();
    });

    it('onClick should toggle isExpertVariable', fakeAsync((): void => {
        component.isExpert = false;
        const spy = spyOn(component, 'adjustDifficulty');
        spyOn(component, 'setVirtualPlayerName').and.stub();
        component.onClick();
        tick(2);
        expect(spy).toHaveBeenCalled();
    }));

    it('onClick should toggle isExpertVariable', (): void => {
        component.isExpert = true;
        spyOn(component, 'setVirtualPlayerName').and.stub();
        component.adjustDifficulty();
        expect(component.level).toEqual('Expert');
    });

    it('onClick should toggle isExpertVariable', (): void => {
        component.isExpert = false;
        spyOn(component, 'setVirtualPlayerName').and.stub();
        component.adjustDifficulty();
        expect(component.level).toEqual('Débutant');
    });
});
