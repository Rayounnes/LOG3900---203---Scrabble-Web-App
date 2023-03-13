import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-accept-player-game',
    templateUrl: './accept-player-game.component.html',
    styleUrls: ['./accept-player-game.component.scss'],
})
export class AcceptPlayerGameComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<AcceptPlayerGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { username: string },
        public socketService: ChatSocketClientService,
    ) {}

    ngOnInit(): void {
        this.connect();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('left-private-player', () => {
            this.dialogRef.close(null);
        });
    }

    onAcceptClick(): void {
        this.dialogRef.close(true);
    }

    onRejectClick(): void {
        this.dialogRef.close(false);
    }
}
