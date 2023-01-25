import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

const WAITING_DELAY = 3000;

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: 'waiting-room-page.component.html',
    styleUrls: ['waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    userKicked = false;
    userLeft = false;
    userCanceled = false;
    isHost: boolean = false;
    isJoinedPlayer: boolean = false;
    hostUsername = '';
    joinedUsername = '';
    leftUsername = '';
    mode: string;
    constructor(public router: Router, private route: ActivatedRoute, public socketService: ChatSocketClientService) {}

    ngOnInit(): void {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
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
        this.socketService.on('create-game', (username: string) => {
            this.hostUsername = username;
            this.isHost = true;
        });
        this.socketService.on('waiting-room-second-player', (username: string) => {
            this.joinedUsername = username;
            this.isJoinedPlayer = true;
        });
        this.socketService.on('add-second-player-waiting-room', (game: Game) => {
            this.joinedUsername = game.usernameTwo;
            this.hostUsername = game.usernameOne;
        });
        this.socketService.on('kick-user', () => {
            this.userKicked = true;
            setTimeout(() => {
                this.router.navigate([`/joindre-partie/${this.mode}`]);
            }, WAITING_DELAY);
        });
        this.socketService.on('joined-user-left', () => {
            this.userLeft = true;
            this.leftUsername = this.joinedUsername;
            this.joinedUsername = '';
        });
        this.socketService.on('join-game', () => {
            this.router.navigate([`/game/${this.mode}`]);
        });
    }
    confirmUser() {
        this.socketService.send('join-game', { playerUsername: this.joinedUsername, mode: this.mode });
    }
    cancelWaitingJoinedUser() {
        this.socketService.send('joined-user-left');
    }
    cancelMatch() {
        this.socketService.send('cancel-match');
    }

    kickUser() {
        this.socketService.send('kick-user', this.joinedUsername);
        this.joinedUsername = '';
    }
}
