import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Placement } from '@app/interfaces/placement';
import { WordArgs } from '@app/interfaces/word-args';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-hint-dialog',
    templateUrl: './hint-dialog.component.html',
    styleUrls: ['./hint-dialog.component.scss'],
})
export class HintDialogComponent implements OnDestroy {
    langue = '';
    theme = '';
    hintWords: WordArgs[] = [];
    hintReceived = false;

    constructor(
        public dialogRef: MatDialogRef<HintDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private socketService: ChatSocketClientService,
    ) {
        this.connect();
    }

    ngOnDestroy(): void {
        this.socketService.socket.off('hint-command');
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
        this.socketService.send('get-config');
        this.socketService.send('hint-command');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('get-config', (config: any) => {
            this.langue = config.langue;
            this.theme = config.theme;
        });
        this.socketService.on('vote-action', () => {
            console.log('closing hint dialog');
            this.dialogRef.close();
        });
        this.socketService.on('hint-command', (hints: Placement[]) => {
            this.hintReceived = true;
            if (hints !== undefined) {
                this.createWord(hints);
            }
        });
    }

    createWord(hints: Placement[]) {
        for (let hint of hints) {
            // let splitedList = hint.command.split("\n");

            if (hint.command === 'Ces seuls placements ont été trouvés:') {
                continue;
            }
            if (hint.command === "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !") {
                return;
            }
            let splitedCommand = hint.command.split(' ');

            let columnWord = Number(splitedCommand[1].substring(1, splitedCommand[1].length - 1)) - 1;
            let lineWord = splitedCommand[1][0].charCodeAt(0) - 97;
            let valueWord = splitedCommand[splitedCommand.length - 1];
            let orientationWord = splitedCommand[1][splitedCommand[1].length - 1];
            if (orientationWord !== 'h' && orientationWord !== 'v') orientationWord = 'h';
            this.hintWords.push({
                line: lineWord,
                column: Number(columnWord),
                value: valueWord,
                orientation: orientationWord,
                points: hint.points,
            } as WordArgs);
        }
    }

    onNoClick(word?: WordArgs): void {
        if (word) {
            this.dialogRef.close(word);
        } else {
            this.dialogRef.close();
        }
    }
}
