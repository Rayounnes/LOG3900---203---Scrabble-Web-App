import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'app-dictionary',
    templateUrl: './dictionary.component.html',
    styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent {
    dicts: Dictionary[] = [];
    selectedDictionary: Dictionary = { title: 'Mon dictionnaire', fileName: 'dictionnary.json' } as Dictionary;
    constructor(
        public confirmationDialog: MatDialogRef<DictionaryComponent>,
        @Inject(MAT_DIALOG_DATA) public dictionaries: Dictionary[],
        public socketService: ChatSocketClientService,
    ) {
        this.updateDictionaries(dictionaries);
    }

    updateDictionaries(dictionaries: Dictionary[]) {
        // ce n'est pas une erreur de lint, je ne peux utilise for-of car 'variable dictionnaries is not iterable'
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < dictionaries.length; i++) {
            this.dicts.push(dictionaries[i]);
        }
    }

    onOK(): void {
        this.confirmationDialog.close(true);
        this.socketService.send('dictionary-selected', this.selectedDictionary);
    }

    onChangeTab(dict: MatTabChangeEvent) {
        this.selectedDictionary = this.dictionaries[dict.index];
    }

    onCancel(): void {
        this.confirmationDialog.close(false);
    }
}
