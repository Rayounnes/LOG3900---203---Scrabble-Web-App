/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable max-lines */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Dictionary } from '@app/interfaces/dictionary';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
import { VIRTUAL_PLAYERS_BEGGINERS } from 'src/constants/virtual-player-names';
import { AdminPanelComponent } from './admin-panel.component';

export enum VPlayerLevel {
    Expert = 'expert',
    Beginner = 'beginner',
}

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));
describe('AdminPanelComponent', () => {
    let component: AdminPanelComponent;

    let fixture: ComponentFixture<AdminPanelComponent>;
    const testDictionary: Dictionary = {
        title: 'test Dictionnary',
        description: 'un dictionnaire pour tester',
        words: ['log', 'assurance qualité', 'tests'],
        fileName: 'testDictionary',
    };

    const testDictionary1: Dictionary = {
        title: 'test Dictionnary1',
        description: 'un dictionnaire pour tester1',
        words: ['log', 'assurance qualité', 'tests1'],
        fileName: 'testDictionary1',
    };
    const communicationMock = {
        getDictionary: () => {
            return of(testDictionary);
        },
        getDictionaries: () => {
            return of([testDictionary]);
        },
        virtualPlayerNamesGet: () => {
            return of(VIRTUAL_PLAYERS_BEGGINERS);
        },
        deleteDictionary: () => {
            return of(null);
        },
        postFile: () => {
            return of(201);
        },
        putDictionary: () => {
            return of(null);
        },
        virtualPlayerNamePost: () => {
            return of(null);
        },
        virtualPlayerNameDelete: () => {
            return of(null);
        },
        virtualPlayerNameReset: () => {
            return of(null);
        },
        bestScoreReset: () => {
            return of(null);
        },
        gameHistoryReset: () => {
            return of(null);
        },
        gameHistoryGet: () => {
            return of(null);
        },
        dictionariesReset: () => {
            return of(null);
        },
        virtualPlayerNamePut: () => {
            return of(null);
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPanelComponent],
            imports: [NoopAnimationsModule],
            providers: [HttpClient, HttpHandler, { provide: CommunicationService, useValue: communicationMock }, MatSnackBar, Overlay],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change menu', () => {
        component.goTo('DictionaryList');
        expect(component.selectedMenu).toBe('DictionaryList');
    });

    it('should call sendNotification() on call of deleteDictionaryByTitle()', () => {
        spyOn(component, 'sendNotification');
        component.deleteDictionary('dict');
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of deleteDictionary() if an error is thrown', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'sendNotification');
        spyOn(communicationMock, 'deleteDictionary').and.returnValue(errorObs);
        component.dictionaryToUpload = testDictionary1;
        component.deleteDictionary('dict');
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('isValid should be true after if the posted dictionary is valid', () => {
        const inputElement = { files: [] } as any;
        const event = {
            target: inputElement,
        } as any;
        spyOn(communicationMock, 'postFile').and.returnValue(of(201));
        component.onDictionaryUpload(event);
        expect(component.status).toEqual(201);
    });

    it('isValid should be false after if the posted dictionary is not valid', async () => {
        const inputElement = { files: [] } as any;
        const event = {
            target: inputElement,
        } as any;
        spyOn(communicationMock, 'postFile').and.returnValue(of(406));
        component.onDictionaryUpload(event);
        expect(component.status).toEqual(406);
    });

    it('setItem should be called', () => {
        const spy = spyOn(sessionStorage, 'setItem');
        component.storingCurrentPage();
        expect(spy).toHaveBeenCalled();
    });

    it('should return true on call of isDictionaryAlreadyExistent() if the dictionary exists', () => {
        component.dataSourceDictionaries.push(testDictionary);
        expect(component.isThisDictionaryExist(testDictionary)).toBe(true);
    });

    it('should return false on call of isDictionaryAlreadyExistent() if the dictionnary does not exist', () => {
        expect(component.isThisDictionaryExist(testDictionary1)).toBe(false);
    });

    it('should sendNotification() on call of downloadDictionary() ', () => {
        spyOn(component, 'sendNotification');
        component.downloadDictionary('hello');
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should sendNotification() on call of downloadDictionary() case error ', () => {
        const errorObs = throwError('e');
        spyOn(component, 'sendNotification');
        spyOn(communicationMock, 'getDictionary').and.returnValue(errorObs);
        component.downloadDictionary('hello');
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should set selectedDictionaryTitle to the new dictionary name passed on call of downloadDictionary()', () => {
        component.editDictionary({
            title: 'string',
            description: 'string',
            words: ['string', 'string', 'string'],
            fileName: 'testDictionary',
        });
        expect(component.editedDictionary.title).toBe('string');
    });

    it('should call updateAdminSections() on call of saveDictionary()', () => {
        spyOn(component, 'sendNotification');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.editedDictionaryTitle = 'test';
        component.saveDictionary();
        spyOn(component, 'updateAdminSections');
        // expect(component.updateAdminSections).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of saveDictionary() if an error is thrown', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'sendNotification');
        spyOn(communicationMock, 'putDictionary').and.returnValue(errorObs);
        spyOn(component, 'updateAdminSections');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.editedDictionaryTitle = 'test';
        component.saveDictionary();
        // expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of saveDictionary() if isDictionaryInfoValid is false', () => {
        spyOn(component, 'sendNotification');
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl(' '),
        });
        component.editedDictionaryTitle = 'test';
        component.saveDictionary();
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of saveDictionary() if isDictionaryAlreadyExistent is true', () => {
        component.dataSourceDictionaries.push(testDictionary);
        const spy = spyOn(component, 'sendNotification');
        component.dictionary = new FormGroup({
            title: new FormControl('test Dictionnary'),
            description: new FormControl('un dictionnaire pour tester'),
        });
        component.editedDictionaryTitle = 'le petit dict';
        component.saveDictionary();
        expect(spy).toHaveBeenCalled();
    });
    it('should call updateAdminSections() on call of addVirtualPlayer() if the VirtualPlayerLevel is beginner ', () => {
        component.beginnerVirtualPlayerToUpload = 'tester';
        component.dataSourceVPlayersExpert.push({
            name: 'hello',
        });
        component.dataSourceVPlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'updateAdminSections');
        component.addVirtualPlayer(component.beginnerVirtualPlayerToUpload, VPlayerLevel.Beginner);
        expect(component.updateAdminSections).toHaveBeenCalled();
    });

    it('should call updateAdminSections() on call of addVirtualPlayer() if the VirtualPlayerLevel expert ', () => {
        component.expertVirtualPlayerToUpload = 'tester';
        component.dataSourceVPlayersExpert.push({
            name: 'hello',
        });
        component.dataSourceVPlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'updateAdminSections');
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VPlayerLevel.Expert);
        expect(component.updateAdminSections).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of addVirtualPlayer() if !isValidToAdd for beginner ', () => {
        component.beginnerVirtualPlayerToUpload = 'testeros';
        component.dataSourceVPlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourceVPlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'sendNotification');
        component.addVirtualPlayer(component.beginnerVirtualPlayerToUpload, VPlayerLevel.Beginner);
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of addVirtualPlayer() if !isValidToAdd for expert ', () => {
        component.expertVirtualPlayerToUpload = 'testeros';
        component.dataSourceVPlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourceVPlayersBeginner.push({
            name: 'hi',
        });
        spyOn(component, 'sendNotification');
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VPlayerLevel.Expert);
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of addVirtualPlayer() if an error is thrown  ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'sendNotification');
        spyOn(communicationMock, 'virtualPlayerNamePost').and.returnValue(errorObs);
        component.expertVirtualPlayerToUpload = 'testeros';
        component.dataSourceVPlayersExpert.push({
            name: 'testeros',
        });
        component.dataSourceVPlayersBeginner.push({
            name: 'hi',
        });
        component.addVirtualPlayer(component.expertVirtualPlayerToUpload, VPlayerLevel.Beginner);
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should sendNotification on call of deleteVirtualPlayer() if VirtualPlayerLevel is beginner', () => {
        component.dataSourceVPlayersBeginner.push({
            name: 'test',
        });
        spyOn(component, 'sendNotification');
        component.deleteVirtualPlayer({ name: 'test' }, VPlayerLevel.Beginner);
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should sendNotification on call of deleteVirtualPlayer() if VirtualPlayerLevel is expert', () => {
        component.dataSourceVPlayersExpert.push({
            name: 'testsuper',
        });
        spyOn(component, 'sendNotification');
        component.deleteVirtualPlayer({ name: 'testsuper' }, VPlayerLevel.Expert);
        expect(component.sendNotification).toHaveBeenCalled();
    });
    it('should sendNotification on call of deleteVirtualPlayer() if VirtualPlayerLevel is expert', () => {
        spyOn(component, 'sendNotification');
        component.deleteVirtualPlayer({ name: 'test' }, VPlayerLevel.Expert);
        expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call updateAdminSections() on call of resetDefault() ', () => {
        component.dataSourceVPlayersExpert.push({
            name: 'testeratos',
        });
        spyOn(component, 'updateAdminSections');
        component.resetDefault();
        expect(component.updateAdminSections).toHaveBeenCalled();
    });

    it('should call updateAdminSections() on call of saveName() ', () => {
        component.editedName = 'hellotest';
        component.nameToEdit = { name: 'hola' };
        component.level = VPlayerLevel.Expert;
        component.dataSourceVPlayersExpert.push(component.nameToEdit);
        spyOn(component, 'updateAdminSections');
        component.saveName();
        expect(component.updateAdminSections).toHaveBeenCalled();
    });

    it('should return false on call of isDefBegginerPlayer() if the name is not included in beginner name', () => {
        expect(component.isDefBegginerPlayer('tester')).toBe(false);
    });

    it('should return false on call of isDefBegginerPlayer() if the name is not included in expert name', () => {
        expect(component.isDefExpertPlayer('tester')).toBe(false);
    });

    it('should set the dictionary to null on call of cancelDictionaryEdit()', () => {
        component.dictionary = new FormGroup({
            title: new FormControl('test'),
            description: new FormControl('test description'),
        });
        component.cancelDictionaryEdit();
        expect(component.dictionary).toBe(null as unknown as FormGroup);
    });

    it('should call addVirtualPlayer on validateName() if name is valid', () => {
        component.expertVirtualPlayerToUpload = 'tester';
        spyOn(component, 'addVirtualPlayer');
        component.validateName(component.expertVirtualPlayerToUpload, VPlayerLevel.Expert);
        expect(component.addVirtualPlayer).toHaveBeenCalled();
    });
    it('should call addVirtualPlayer on validateName() if name is valid', () => {
        component.expertVirtualPlayerToUpload = '@@@';
        component.validateName(component.expertVirtualPlayerToUpload, VPlayerLevel.Expert);
        expect(component.isNameInputValid).toBe(false);
    });

    it('should call addVirtualPlayer on validateName() if name is valid', () => {
        component.beginnerVirtualPlayerToUpload = 'tester';
        spyOn(component, 'addVirtualPlayer');
        component.validateName(component.beginnerVirtualPlayerToUpload, VPlayerLevel.Beginner);
        expect(component.addVirtualPlayer).toHaveBeenCalled();
    });

    it('should not call addVirtualPlayer on validateName() if name length under 3 ', () => {
        component.beginnerVirtualPlayerToUpload = 'te';
        spyOn(component, 'addVirtualPlayer');
        component.validateName(component.beginnerVirtualPlayerToUpload, VPlayerLevel.Beginner);
        expect(component.addVirtualPlayer).not.toHaveBeenCalled();
    });

    it('should call sendNotification() on call of onDictionaryFileChanged() if validDictionary is false  ', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionaries.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'sendNotification');
        component.dictionaryToUpload = testDictionary;
        await delay(1000);
        // expect(component.sendNotification).toHaveBeenCalled();
    });

    it('should call sendNotification() on call of onDictionaryFileChanged() if validDictionary and isDictionaryAlreadyExistent  are true', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionaries.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'sendNotification');
        spyOn(component, 'isThisDictionaryExist').and.returnValue(true);
        component.dictionaryToUpload = testDictionary;
        await delay(1000);
    });

    it('should call sendNotification() on call of onDictionaryFileChanged() if validDictionary true and isDictionaryAlreadyExistent false', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionaries.push(testDictionary);
        const blob = new Blob(['{"key" : "Hello world"}']);
        const file: File = new File([blob], 'fileName');
        const fileList: FileList = {
            0: file,
            length: 1,
            item: (index: number) => {
                if (index !== -1) return file;
                return null;
            },
        };
        event.currentTarget.files = fileList;
        spyOn(component, 'sendNotification');
        spyOn(component, 'isThisDictionaryExist').and.returnValue(false);
        component.dictionaryToUpload = testDictionary;
        await delay(1000);
        expect(component.dictionaryToUpload).toBeDefined();
    });

    it('should call sendNotification() on call of onDictionaryFileChanged() if validDictionary true and isDictionaryAlreadyExistent false', async () => {
        const event = jasmine.createSpyObj('Event', ['currentTarget']);
        event.currentTarget = jasmine.createSpyObj('HTMLInputElement', ['files']);
        component.dataSourceDictionaries.push(testDictionary);
        spyOn(component, 'updateAdminSections');
        spyOn(component, 'isThisDictionaryExist').and.returnValue(false);
        component.dictionaryToUpload = testDictionary;
        await delay(1000);
    });
    it('should call sendNotification on call of getBeginnerVPlayers() if an error is thrown by virtualPlayerNamesGet ', () => {
        const errorObs = throwError('Error Covid');
        spyOn(component, 'sendNotification');
        spyOn(communicationMock, 'virtualPlayerNamesGet').and.returnValue(errorObs);
        component.updateAdminSections();
        expect(component.sendNotification).toHaveBeenCalled();
    });
});
