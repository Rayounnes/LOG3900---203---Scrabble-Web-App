import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LetterExchange } from '@app/interfaces/letter-exchange';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-exchange-dialog',
    templateUrl: './exchange-dialog.component.html',
    styleUrls: ['./exchange-dialog.component.scss'],
})
export class ExchangeDialogComponent {
    items: LetterExchange[] = [
        { label: this.data.rackList[0], checked: false },
        { label: this.data.rackList[1], checked: false },
        { label: this.data.rackList[2], checked: false },
        { label: this.data.rackList[3], checked: false },
        { label: this.data.rackList[4], checked: false },
        { label: this.data.rackList[5], checked: false },
        { label: this.data.rackList[6], checked: false },
    ];

    checkedItems: LetterExchange[] = [];
    exchangeWord: string = '';

    constructor(
        public dialogRef: MatDialogRef<ExchangeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public socketService: ChatSocketClientService,
    ) {
        this.configureBaseSocketFeatures();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    configureBaseSocketFeatures() {
        this.socketService.on('vote-action', () => {
            this.onNoClick();
        });
        this.socketService.on('user-turn', () => {
            this.onNoClick();
        });
    }
    onChange() {
        this.exchangeWord = '';
        this.checkedItems = this.items.filter((item) => item.checked);
        for (let i = 0; i < this.checkedItems.length; i++) {
            // this.exchangeword+=item;
            this.exchangeWord += this.checkedItems[i].label;
        }
    }
}
