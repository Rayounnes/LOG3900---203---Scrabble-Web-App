import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
@Component({
    selector: 'app-white-letter-dialog',
    templateUrl: './white-letter-dialog.component.html',
    styleUrls: ['./white-letter-dialog.component.scss'],
})
export class WhiteLetterDialogComponent {
    alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    langue = '';
    theme = '';

    constructor(
        public dialogRef: MatDialogRef<WhiteLetterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private socketService: ChatSocketClientService,
    ) {
        this.connect();
    }

    onNoClick(letter: string): void {
        if (letter) {
            this.dialogRef.close(letter);
        } else {
            this.dialogRef.close();
        }
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
        this.socketService.send('get-config');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('get-config', (config: any) => {
            this.langue = config.langue;
            this.theme = config.theme;
        });
        this.socketService.on('vote-action', () => {
            this.dialogRef.close();
        });
    }
}
