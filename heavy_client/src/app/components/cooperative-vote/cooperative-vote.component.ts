import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CooperativeAction } from '@app/interfaces/cooperative-action';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-cooperative-vote',
    templateUrl: './cooperative-vote.component.html',
    styleUrls: ['./cooperative-vote.component.scss'],
})
export class CooperativeVoteComponent implements OnInit {
    action: CooperativeAction;
    constructor(
        public dialogRef: MatDialogRef<CooperativeVoteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public socketService: ChatSocketClientService,
    ) {}

    ngOnInit(): void {
        this.connect();
        this.action = this.data.vote;
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('update-vote-action', (action: CooperativeAction) => {
            this.action = action;
        });
        this.socketService.on('accept-action', (coopAction: CooperativeAction) => {
            // utiliser la close data pour afficher un snack bar accepté ou rejeté
            this.action = coopAction;
            this.dialogRef.close({ action: this.action, isAccepted: true });
        });
        this.socketService.on('reject-action', (coopAction: CooperativeAction) => {
            this.action = coopAction;
            this.dialogRef.close({ action: this.action, isAccepted: false });
        });
    }
    acceptAction() {
        this.socketService.send('player-vote', true);
    }
    rejectAction() {
        this.socketService.send('player-vote', false);
    }
}
