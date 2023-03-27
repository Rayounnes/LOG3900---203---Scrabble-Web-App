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
    action!: CooperativeAction;
    usernameAndAvatars: any = {}; // { socketId : [username,avatar]}
    infoget: boolean = false;
    constructor(
        public dialogRef: MatDialogRef<CooperativeVoteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public socketService: ChatSocketClientService,
    ) {
        this.action = this.data.vote;
        this.getUsernameAndAvatar();
    }

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
        this.socketService.on('choice-pannel-info', (usernamesAndAvatar: any) => {
            this.usernameAndAvatars = usernamesAndAvatar;
            this.infoget = true;
            console.log('recu client');
            console.log(usernamesAndAvatar);
        });
    }
    acceptAction() {
        this.socketService.send('player-vote', true);
    }
    rejectAction() {
        this.socketService.send('player-vote', false);
    }

    getKeys(object: any): string[] {
        return Object.keys(object);
    }

    getUsernameAndAvatar() {
        this.socketService.send('choice-pannel-info', this.getKeys(this.action.socketAndChoice));
    }

    getPlayerClass(socketId: string) {
        if (this.action.socketAndChoice[socketId] == 'choice') {
            return 'choice';
        } else if (this.action.socketAndChoice[socketId] == 'yes') {
            return 'yes';
        } else {
            return 'no';
        }
    }
}
