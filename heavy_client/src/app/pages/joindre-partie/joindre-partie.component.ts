import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GamePasswordFormComponent } from '@app/components/game-password-form/game-password-form.component';
import { PrivateGameWaitingComponent } from '@app/components/private-game-waiting/private-game-waiting.component';
import { MatSnackBar } from '@angular/material/snack-bar';

// import { Dictionary } from '@app/interfaces/dictionary';

@Component({
    selector: 'app-joindre-partie',
    templateUrl: './joindre-partie.component.html',
    styleUrls: ['./joindre-partie.component.scss'],
})
export class JoindrePartieComponent implements OnInit {
    gameList: Game[] = [];
    paramsObject: any;
    mode: string;
    isClassic: boolean;
    constructor(
        public router: Router,
        public socketService: ChatSocketClientService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
            console.log(this.paramsObject);
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        this.mode = this.isClassic ? 'Classique' : 'Coopératif';
        this.connect();
        this.socketService.send('update-joinable-matches', this.isClassic);
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('update-joinable-matches', (param: Game[]) => {
            this.gameList = param;
            this.gameList.push();
        });
    }

    goToWaitingRoom(gameToJoin: Game) {
        this.socketService.send('waiting-room-player', gameToJoin);
        this.router.navigate(['/waiting-room'], { queryParams: { isClassicMode: this.isClassic } });
    }

    observeGame(gameToJoin: Game) {
        // changer par le socket pour aller a une partie
        if (gameToJoin.hasStarted) this.socketService.send('waiting-room-player', gameToJoin);
        else {
            this.socketService.send('waiting-room-observer', gameToJoin);
            this.router.navigate(['/waiting-room'], { queryParams: { isClassicMode: this.isClassic } });
        }
    }

    joinAsObserver(gameToJoin: Game) {
        if (gameToJoin.password) {
            const dialogRef = this.dialog.open(GamePasswordFormComponent, {
                data: { password: gameToJoin.password },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) this.observeGame(gameToJoin);
            });
        } else if (!gameToJoin.isPrivate) {
            this.observeGame(gameToJoin);
        }
    }

    joinWaitingRoom(gameToJoin: Game) {
        if (gameToJoin.password) {
            this.socketService.send('waiting-password-game', gameToJoin);
            const dialogRef = this.dialog.open(GamePasswordFormComponent, {
                data: { password: gameToJoin.password },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) this.goToWaitingRoom(gameToJoin);
                else this.socketService.send('cancel-waiting-password', gameToJoin);
            });
        } else if (!gameToJoin.isPrivate) {
            this.goToWaitingRoom(gameToJoin);
        } else if (gameToJoin.isPrivate) {
            this.socketService.send('private-room-player', gameToJoin);
            const privateDialogRef = this.dialog.open(PrivateGameWaitingComponent, {
                disableClose: true,
            });

            privateDialogRef.afterClosed().subscribe((result) => {
                if (result === null) this.socketService.send('left-private-player', gameToJoin);
                else if (result) this.goToWaitingRoom(gameToJoin);
                else if (!result) {
                    const message = 'Vous avez été rejeté de la partie.';
                    this.snackBar.open(message, 'Fermer', {
                        duration: 1000,
                        panelClass: ['snackbar'],
                    });
                }
            });
        }
    }
}
