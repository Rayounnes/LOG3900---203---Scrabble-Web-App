import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dictionary } from '@app/interfaces/dictionary';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { CommunicationService } from '@app/services/communication.service';
import { saveAs } from 'file-saver';
import {
    BEGGINERS_NAMES,
    EXPERTS_NAMES,
    VIRTUAL_PLAYERS_BEGGINERS,
    VIRTUAL_PLAYERS_EXPERTS,
    VPlayerLevel,
    VPlayerName,
} from 'src/constants/virtual-player-names';
const SUCCES = 201;

const WAITING_DELAY = 700;

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent implements OnInit {
    selectedMenu: string;
    dataSourceVPlayersBeginner: VPlayerName[];
    dataSourceVPlayersExpert: VPlayerName[];
    dataSourceGameHistory: GameHistory[];
    dictionaryToUpload: Dictionary;
    dataSourceDictionaries: Dictionary[];
    editedName: string;
    editedDictionaryTitle: string;
    dictionary: FormGroup;
    throbber: boolean;
    dictionaries: Dictionary[] = [];
    isNameInputValid: boolean;
    isNameInputBeginnerValid: boolean;
    editedDictionary: Dictionary;
    nameToEdit: VPlayerName;
    beginnerVPlayerLevel: VPlayerLevel;
    expertVPlayerLevel: VPlayerLevel;
    expertVirtualPlayerToUpload: string;
    displayedColumnsPlayerTable: string[];
    displayedColumnsGameHistory: string[];
    displayedColumnsDictionaries: string[];
    beginnerVirtualPlayerToUpload: string;
    editBeginnerVPlayer: boolean;
    editExpertVPlayer: boolean;
    level: VPlayerLevel;
    defaultDictionary: string;
    status: number;

    constructor(private communicationService: CommunicationService, private snackBar: MatSnackBar) {
        this.throbber = false;
        this.displayedColumnsPlayerTable = ['name'];
        this.displayedColumnsGameHistory = [
            'date',
            'duration',
            'playerName',
            'finalScore',
            'opponentPlayerName',
            'oponnentFinalScore',
            'mode',
            'comment',
        ];
        this.displayedColumnsDictionaries = ['title', 'description'];
        this.dataSourceVPlayersBeginner = VIRTUAL_PLAYERS_BEGGINERS;
        this.dataSourceVPlayersExpert = VIRTUAL_PLAYERS_EXPERTS;
        this.dataSourceGameHistory = [];
        this.dataSourceDictionaries = [];
        this.beginnerVirtualPlayerToUpload = '';
        this.nameToEdit = { name: '' };
        this.level = VPlayerLevel.Beginner;
        this.isNameInputValid = true;
        this.isNameInputBeginnerValid = true;
        this.beginnerVPlayerLevel = VPlayerLevel.Beginner;
        this.expertVPlayerLevel = VPlayerLevel.Expert;
        this.defaultDictionary = 'Mon dictionnaire';
    }
    @HostListener('window:beforeunload')
    storingCurrentPage(): void {
        sessionStorage.setItem('page', this.selectedMenu);
    }

    ngOnInit(): void {
        if (sessionStorage.getItem('page')) this.selectedMenu = sessionStorage.getItem('page') as string;
        else this.goTo(this.selectedMenu);
        this.updateAdminSections();
    }
    goTo(params: string) {
        this.selectedMenu = params;
    }
    resetDefault() {
        this.communicationService.virtualPlayerNameReset().subscribe();
        this.communicationService.dictionariesReset().subscribe();
        this.communicationService.bestScoreReset().subscribe();
        this.communicationService.gameHistoryReset().subscribe();
        this.updateAdminSections();
    }
    /* *********************** dictionary methods ******************************* */

    downloadDictionary(title: string) {
        this.throbber = true;
        this.communicationService.getDictionary(title).subscribe(
            (dictionary) => {
                const json = JSON.stringify(dictionary);
                const blob = new Blob([json], { type: 'application/json' });
                saveAs(blob, title);
                this.sendNotification('Le dictionnaire ' + title + ' a été téléchargé avec succès');
            },
            () => {
                this.sendNotification("Le dictionnaire n'a pas pu être téléchargé");
                this.throbber = false;
            },
            () => (this.throbber = false),
        );
    }

    deleteDictionary(title: string) {
        this.throbber = true;

        this.communicationService.deleteDictionary(title).subscribe(
            () => {
                this.sendNotification('Le dictionnaire ' + title + ' a été effacé avec succès');
                this.updateAdminSections();
            },
            () => this.sendNotification('Le dictionnaire ' + title + ' ne peut pas être effacé'),
            () => (this.throbber = false),
        );
    }
    editDictionary(dictionaryInfo: Dictionary) {
        this.dictionary = new FormGroup({
            title: new FormControl(dictionaryInfo.title),
            description: new FormControl(dictionaryInfo.description),
        });
        this.editedDictionary = dictionaryInfo;
    }

    getAllDictionaries(): void {
        this.communicationService.getDictionaries().subscribe((dictionaries) => {
            this.dataSourceDictionaries = dictionaries;
        });
    }

    getGameHistory(): void {
        this.communicationService.gameHistoryGet().subscribe((scores) => {
            this.dataSourceGameHistory = scores;
        });
    }

    getBeginnerVPlayers(): void {
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Beginner).subscribe(
            (results) => (this.dataSourceVPlayersBeginner = results),
            () => {
                this.sendNotification('Impossible de dactualiser la liste de noms de joueurs  débutants');
            },
        );
    }

    getExpertVPlayers(): void {
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Expert).subscribe(
            (results) => (this.dataSourceVPlayersExpert = results),
            () => {
                this.sendNotification('Impossible dactualiser la liste de noms de joueurs  experts');
            },
        );
    }

    onDictionaryUpload(event: Event) {
        this.updateAdminSections();
        const target = event.target;
        const files = (target as HTMLInputElement).files as FileList;
        const file: File = files[0];
        this.throbber = true;

        this.communicationService.postFile(file).subscribe((res: number) => {
            this.status = res;
        });

        setTimeout(() => {
            if (this.status === SUCCES) {
                this.sendNotification('Le dictionnaire a été téléversé avec succès');
            } else this.sendNotification('Impossible de téléverser ce dictionnaire');
            this.throbber = false;
            this.updateAdminSections();
        }, WAITING_DELAY);
    }
    saveDictionary() {
        this.updateAdminSections();
        this.throbber = true;
        const dictInfo = {
            title: this.dictionary.value.title,
            description: this.dictionary.value.description,
        } as Dictionary;
        const isDictionaryInfoValid = this.checkDictionaryInfo(dictInfo);
        if (!isDictionaryInfoValid) {
            this.sendNotification('Veuillez entrer un titre et une description valide et non pour le dictionnaire');
            this.dictionary = null as unknown as FormGroup;
            return;
        }
        const isDictionaryAlreadyExistent = this.isThisDictionaryExist(dictInfo);
        if (isDictionaryAlreadyExistent) {
            this.sendNotification('Un dictionnaire ayant le meme titre que la nouvelle version du dictionnaire modifié existe déjà');
            this.dictionary = null as unknown as FormGroup;
            this.throbber = false;
            return;
        }
        this.throbber = true;
        this.communicationService.putDictionary(this.editedDictionary, dictInfo).subscribe(
            () => {
                this.sendNotification('Le dictionnaire a été modifié avec succès');
                this.updateAdminSections();
            },
            () => {
                this.sendNotification('Impossible de modifier ce dictionnaire');
                this.updateAdminSections();
            },
            () => {
                this.throbber = false;
                this.dictionary = null as unknown as FormGroup;
            },
        );
        this.throbber = false;
        this.updateAdminSections();
    }
    isThisDictionaryExist(dictionary: Dictionary): boolean {
        let isDictionaryAlreadyExistent = false;
        for (const dictionaryInfo of this.dataSourceDictionaries) {
            if (dictionaryInfo.title === dictionary.title /* && dictionaryInfo.description === dictionary.description */)
                isDictionaryAlreadyExistent = true;
        }
        return isDictionaryAlreadyExistent;
    }
    checkDictionaryInfo(dictionary: Dictionary): boolean {
        const isDictTitleEmpty = !dictionary.title || !dictionary.title.replace(/\s/g, '').length;
        const isDictDescriptionEmpty = !dictionary.description || !dictionary.description.replace(/\s/g, '').length;
        return !isDictTitleEmpty && !isDictDescriptionEmpty;
    }
    cancelDictionaryEdit() {
        this.dictionary = null as unknown as FormGroup;
    }
    validateName(virtualPlayerToUpload: string, chosenPlayerLevel: VPlayerLevel): void {
        const regexFormat = new RegExp('^[a-z0-9A-Z]{3,8}$');
        const isNameValid = regexFormat.test(virtualPlayerToUpload);
        if (!isNameValid && chosenPlayerLevel === VPlayerLevel.Beginner) {
            this.isNameInputBeginnerValid = false;
            return;
        } else if (!isNameValid && chosenPlayerLevel === VPlayerLevel.Expert) {
            this.isNameInputValid = false;
            return;
        } else {
            this.isNameInputValid = true;
            this.isNameInputBeginnerValid = true;
            this.addVirtualPlayer(virtualPlayerToUpload, chosenPlayerLevel);
        }
    }
    saveName() {
        this.throbber = true;
        const editedVirtualPlayer: VPlayerName = { name: this.editedName };
        if (!this.isDefBegginerPlayer(this.editedName) && !this.isDefExpertPlayer(this.editedName))
            this.communicationService.virtualPlayerNamePut(this.nameToEdit.name, editedVirtualPlayer, this.level).subscribe(() => {
                this.sendNotification('Le joueur ' + this.nameToEdit.name + ' a été modifié avec succès');
                this.updateAdminSections();
            });
        this.throbber = false;
        this.updateAdminSections();
    }

    isDefBegginerPlayer(name: string): boolean {
        return BEGGINERS_NAMES.includes(name);
    }
    isDefExpertPlayer(name: string): boolean {
        return EXPERTS_NAMES.includes(name);
    }
    updateAdminSections() {
        this.getAllDictionaries();
        this.getGameHistory();
        this.getBeginnerVPlayers();
        this.getExpertVPlayers();
    }

    sendNotification(message: string) {
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
    }

    addVirtualPlayer(virtualPlayerToUpload: string, level: VPlayerLevel): void {
        const virtualPlayerToAdd: VPlayerName = { name: virtualPlayerToUpload };
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Beginner).subscribe((results) => (this.dataSourceVPlayersBeginner = results));
        const filterArrayBeginner = this.dataSourceVPlayersBeginner.filter((virtualPlayerName) => {
            return virtualPlayerName.name === virtualPlayerToAdd.name;
        });
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Expert).subscribe((results) => (this.dataSourceVPlayersExpert = results));
        const filterArrayExpert = this.dataSourceVPlayersExpert.filter((virtualPlayerName) => {
            return virtualPlayerName.name === virtualPlayerToAdd.name;
        });
        const isValidToAdd: boolean = filterArrayBeginner.length === 0 && filterArrayExpert.length === 0;
        if (isValidToAdd) {
            this.throbber = true;
            this.communicationService.virtualPlayerNamePost(virtualPlayerToAdd, level).subscribe(() => {
                this.throbber = false;
                const notificationMessage =
                    level === VPlayerLevel.Beginner
                        ? 'Le joueur virtuel débutant a été ajouté avec succès'
                        : 'Le joueur virtuel expert a été ajouté avec succès';
                this.sendNotification(notificationMessage);
                this.updateAdminSections();
            });
            this.beginnerVirtualPlayerToUpload = '';
            this.expertVirtualPlayerToUpload = '';
            this.throbber = true;
            this.updateAdminSections();
        } else {
            const notificationMessage =
                level === VPlayerLevel.Beginner ? 'Ce nom du joueur virtuel debutant existe déja ' : 'Ce nom du joueur virtuel expert existe déja ';
            this.sendNotification(notificationMessage);
        }
    }
    deleteVirtualPlayer(virtualPlayerToDelete: VPlayerName, level: VPlayerLevel): void {
        this.throbber = true;
        this.communicationService.virtualPlayerNameDelete(virtualPlayerToDelete, level).subscribe(() => {
            const notificationMessage =
                level === VPlayerLevel.Beginner
                    ? 'Le joueur virtuel débutant ' + virtualPlayerToDelete.name + ' a été effacé avec succès'
                    : 'Le joueur virtuel expert ' + virtualPlayerToDelete.name + ' a été effacé avec succès';
            this.sendNotification(notificationMessage);
            this.updateAdminSections();
        });
        this.throbber = false;
        this.updateAdminSections();
    }
}
