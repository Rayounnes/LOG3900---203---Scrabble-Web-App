import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcceptPlayerGameComponent } from '@app/components/accept-player-game/accept-player-game.component';
// import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { Game } from '@app/interfaces/game';
import { PlayerInfos } from '@app/interfaces/player-infos';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: 'waiting-room-page.component.html',
    styleUrls: ['waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    isHost: boolean = false;
    isObserver: boolean = false;
    isClassic: boolean = false;
    hostUsername = '';
    paramsObject: any;
    mode: string;
    game = {
        hostUsername: '',
        isPrivate: false,
        isFullPlayers: false,
        joinedPlayers: [{ username: '', socketId: '' }],
        joinedObservers: [{ username: '', socketId: '' }],
        humanPlayers: 2,
    } as Game;

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        public socketService: ChatSocketClientService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    onCreateGameClick(): void {
        console.log('Creating game...');
    }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        this.mode = this.isClassic ? 'Classique' : 'Coopératif';
        this.connect();
    }

    ngOnDestroy(): void {
        this.socketService.socket.off('create-game');
        this.socketService.socket.off('waiting-room-player');
        this.socketService.socket.off('waiting-player-status');
        this.socketService.socket.off('private-room-player');
        this.socketService.socket.off('joined-user-left');
        this.socketService.socket.off('joined-observer-left');
        this.socketService.socket.off('cancel-match');
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('create-game', (game: Game) => {
            this.game = game;
            this.isHost = true;
        });
        this.socketService.on('waiting-room-player', (game: Game) => {
            this.game = game;
        });
        this.socketService.on('waiting-player-status', (isObserver: boolean) => {
            this.isObserver = isObserver;
        });
        this.socketService.on('private-room-player', (userInfos: PlayerInfos) => {
            this.openAcceptDialog(userInfos);
        });

        this.socketService.on('joined-user-left', (username: string) => {
            const message = `${username} a quitté la partie.`;
            this.snackBar.open(message, 'Fermer', {
                duration: 3000,
                panelClass: ['snackbar'],
            });
        });
        this.socketService.on('joined-observer-left', (username: string) => {
            const message = `${username} a quitté l'observation de la partie.`;
            this.snackBar.open(message, 'Fermer', {
                duration: 3000,
                panelClass: ['snackbar'],
            });
        });
        this.socketService.on('join-game', () => {
            this.router.navigate([`/game/${this.mode}`]);
        });
        this.socketService.on('cancel-match', () => {
            const message = 'La partie a été annulée.';
            this.snackBar.open(message, 'Fermer', {
                duration: 3000,
                panelClass: ['snackbar'],
            });
            this.router.navigate(['/joindre-partie'], { queryParams: { isClassicMode: this.isClassic } });
        });
    }

    cancelWaiting() {
        this.socketService.send('joined-user-left', this.isObserver);
        this.router.navigate(['/joindre-partie'], { queryParams: { isClassicMode: this.isClassic } });
    }
    cancelMatch() {
        this.socketService.send('cancel-match');
        this.router.navigate(['/mode'], { queryParams: { isClassicMode: this.isClassic } });
    }

    openAcceptDialog(userInfos: PlayerInfos): void {
        const dialogRef = this.dialog.open(AcceptPlayerGameComponent, {
            width: 'auto',
            data: { username: userInfos.username },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === null) {
                const message = `${userInfos.username} a quitté l'attente d'acceptation.`;
                this.snackBar.open(message, 'Fermer', {
                    duration: 3000,
                    panelClass: ['snackbar'],
                });
            } else if (result) {
                this.socketService.send('accept-private-player', userInfos);
            } else {
                this.socketService.send('reject-private-player', userInfos);
            }
        });
    }
}
