import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-private-game-waiting',
    templateUrl: './private-game-waiting.component.html',
    styleUrls: ['./private-game-waiting.component.scss'],
})
export class PrivateGameWaitingComponent implements OnInit {
    userKicked: boolean = false;
    constructor(public dialogRef: MatDialogRef<PrivateGameWaitingComponent>, public socketService: ChatSocketClientService) {}

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
        this.socketService.on('kick-user', () => {
            this.userKicked = true;
            this.dialogRef.close();
        });
    }

    cancelWaitingJoinedUser() {
        this.socketService.send('joined-user-left');
        this.dialogRef.close();
    }
}
