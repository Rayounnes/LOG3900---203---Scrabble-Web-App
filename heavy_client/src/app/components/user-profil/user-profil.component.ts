import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';
import { UsernameEditComponent } from '@app/components/username-edit/username-edit.component';
import { AvatarSelectionComponent } from '../avatar-selection/avatar-selection.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenshotDialogComponent } from '../screenshot-dialog/screenshot-dialog.component';

@Component({
    selector: 'app-user-profil',
    templateUrl: './user-profil.component.html',
    styleUrls: ['./user-profil.component.scss'],
})
export class UserProfilComponent implements OnInit, OnDestroy {
    username: string = '';
    currentIcon: string = '';
    currentCategory: string = 'Parties';
    connexionHistory: any[] = [];
    dialogRef: any;
    avatarChoosed: string = '';
    screenshots: string[][] = []; //[[image,commentaire],[image,commentaire]]
    dialogConfig = new MatDialogConfig();
    numberOfGames: number = 0;
    numberOfGamesWon: number = 0;
    pointsMean: number = 0;
    timeAverage: string = '';
    gameHistory: any = [];
    langue = '';
    theme = '';

    constructor(
        private communicationService: CommunicationService,
        public socketService: ChatSocketClientService,
        private dialog: MatDialog,
        private _snackBar: MatSnackBar,
    ) {
        this.connect();
    }

    ngOnDestroy(): void {
        this.socketService.socket.off('sendUsername');
        this.socketService.socket.off('get-number-games');
        this.socketService.socket.off('get-number-games-won');
        this.socketService.socket.off('get-points-mean');
        this.socketService.socket.off('get-game-average');
        this.socketService.socket.off('get-game-history');
        this.socketService.socket.off('get-config');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('sendUsername', (uname: string) => {
            this.username = uname;
            this.getAvatar();
            this.getConnexionHistory();
            this.getScreenshots();
        });
        this.socketService.on('get-number-games', (games: number) => {
            this.numberOfGames = games;
        });
        this.socketService.on('get-number-games-won', (games: number) => {
            this.numberOfGamesWon = games;
        });
        this.socketService.on('get-points-mean', (points: number) => {
            this.pointsMean = points;
        });
        this.socketService.on('get-game-average', (average: string) => {
            this.timeAverage = average;
        });
        this.socketService.on('get-game-history', (gameHistory: any) => {
            this.gameHistory = gameHistory;
        });
        this.socketService.on('get-config', (config: any) => {
            this.langue = config.langue;
            this.theme = config.theme;
        });
    }

    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('sendUsername');
        this.socketService.send('get-config');
    }

    getAvatar() {
        this.communicationService.getAvatar(this.username).subscribe((icon: string[]) => {
            if (icon.length > 0) {
                this.currentIcon = icon[0];
            }
        });
    }

    changeCategory(newCategory: string) {
        this.currentCategory = newCategory;
    }

    getConnexionHistory() {
        this.communicationService.getUserConnexions(this.username).subscribe((history: any[]) => {
            this.connexionHistory = history.reverse();
        });
    }

    getScreenshots() {
        this.communicationService.getUserScreenShot(this.username).subscribe((screenshots: any) => {
            this.screenshots = screenshots;
            console.log(this.screenshots);
        });
    }

    openScreenShot(image: string) {
        this.dialogConfig.width = '100%';
        this.dialogConfig.height = '100%';
        this.dialogConfig.data = { image: image, hideComment: true };
        const dialogRef = this.dialog.open(ScreenshotDialogComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe(() => {});
    }

    chooseAvatar() {
        this.dialogRef = this.dialog.open(AvatarSelectionComponent, {
            width: '1500px',
            height: '750px',
        });
        const subscription = this.dialogRef.componentInstance.avatar.subscribe((avatar: string) => {
            if (avatar) {
                if (this.currentIcon !== avatar) {
                    this.currentIcon = avatar;
                    this.communicationService.changeIcon(this.username, this.currentIcon).subscribe((isValid: boolean) => {
                        this.socketService.send('icon-change', { username: this.username, icon: this.currentIcon });
                        return isValid;
                    });
                }

                subscription.unsubscribe();
            }
        });
    }

    changeUsername() {
        this.dialogRef = this.dialog.open(UsernameEditComponent);

        const subscription = this.dialogRef.componentInstance.username.subscribe((newUsername: string) => {
            if (newUsername.length > 4 && newUsername !== this.username) {
                this.communicationService.changeUsername(this.username, newUsername).subscribe((isValid: boolean) => {
                    if (isValid) {
                        this.username = newUsername;
                        this.socketService.send('change-username', newUsername);
                    } else {
                        if (this.langue == 'fr') {
                            this._snackBar.open('Ce username est deja utilisé !', 'Fermer');
                        } else {
                            this._snackBar.open('This username is already used !', 'Close');
                        }
                    }
                });
                subscription.unsubscribe();
            } else {
                if (this.langue == 'fr') {
                    this._snackBar.open('Vous possédez deja ce username ;)', 'Fermer');
                } else {
                    this._snackBar.open('This username is already yours ;)', 'Close');
                }
            }
        });
    }

    ngOnInit(): void {
        this.socketService.send('get-number-games');
        this.socketService.send('get-number-games-won');
        this.socketService.send('get-points-mean');
        this.socketService.send('get-game-average');
        this.socketService.send('get-game-history');
    }

    ngOnInit(): void {
        this.socketService.send('get-number-games');
        this.socketService.send('get-number-games-won');
        this.socketService.send('get-points-mean');
        this.socketService.send('get-game-average');
        this.socketService.send('get-game-history');
    }
}
