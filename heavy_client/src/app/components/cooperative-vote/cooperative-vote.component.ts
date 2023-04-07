import { Component, Inject, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CooperativeAction } from '@app/interfaces/cooperative-action';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-cooperative-vote',
    templateUrl: './cooperative-vote.component.html',
    styleUrls: ['./cooperative-vote.component.scss'],
})
export class CooperativeVoteComponent implements OnInit, OnDestroy {
    @ViewChild('circleProgress') circleProgress!: ElementRef<SVGElement>;

    action!: CooperativeAction;
    usernameAndAvatars: any = {}; // { socketId : [username,avatar]}
    infoget: boolean = false;
    choiceMade: boolean = false;
    timer: ReturnType<typeof setInterval>;
    clock: number = 60;
    langue = '';
    theme = '';

    constructor(
        public dialogRef: MatDialogRef<CooperativeVoteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public socketService: ChatSocketClientService,
    ) {
        this.action = this.data.vote;
        console.log(this.data);
        this.getUsernameAndAvatar();
        this.setCreator();
        this.timer = setInterval(() => this.intervalHandler(), 1000);
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
        this.socketService.send('get-config');
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
        this.socketService.on('get-config', (config: any) => {
            this.langue = config.langue;
            this.theme = config.theme;
        });
    }
    acceptAction() {
        this.choiceMade = true;
        this.socketService.send('player-vote', true);
    }
    rejectAction() {
        this.choiceMade = true;
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

    intervalHandler() {
        this.clock--;
        this.updateProgress(this.clock / 60);
        if (this.clock === 0) {
            if (!this.choiceMade && !this.data.isObserver) this.rejectAction();
            clearInterval(this.timer);
        }
    }

    updateProgress(timeFraction: number): void {
        const circle = this.circleProgress.nativeElement;
        const radius = parseFloat(circle.getAttribute('r')!);
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - timeFraction);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
    }

    setCreator() {
        if (this.action.socketAndChoice[this.socketService.socketId] == 'yes') {
            this.choiceMade = true;
        }
    }

    getCircleClass() {
        if (this.clock < 20) {
            return 'circle__progress--red';
        } else if (this.clock < 40) {
            return 'circle__progress--orange';
        } else {
            return 'circle__progress';
        }
    }

    getTextColor() {
        if (this.clock < 20) {
            return 'red';
        } else if (this.clock < 40) {
            return 'orange';
        } else {
            return '#3f9540';
        }
    }
    resetProgressCircle(): void {
        if (this.circleProgress) {
            this.updateProgress(1);
        }
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
        console.log('disposing cooperative sockets');
        this.socketService.socket.off('update-vote-action');
        this.socketService.socket.off('accept-action');
        this.socketService.socket.off('reject-action');
        this.socketService.socket.off('choice-pannel-info');
        this.socketService.socket.off('get-config');
    }
}
