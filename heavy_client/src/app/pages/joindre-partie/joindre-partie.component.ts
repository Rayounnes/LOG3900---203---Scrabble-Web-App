import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GamePasswordFormComponent } from '@app/components/game-password-form/game-password-form.component';
import { PrivateGameWaitingComponent } from '@app/components/private-game-waiting/private-game-waiting.component';

// import { Dictionary } from '@app/interfaces/dictionary';

@Component({
    selector: 'app-joindre-partie',
    templateUrl: './joindre-partie.component.html',
    styleUrls: ['./joindre-partie.component.scss'],
})
export class JoindrePartieComponent implements OnInit {
    gameList: Game[] = [];
    displayUsernameFormGame: boolean[] = [false];
    openedGameWindow: number[] = [];
    username: string = '';
    click: boolean = false;
    paramsObject: any;
    mode: string;
    isClassic: boolean;
    constructor(public socketService: ChatSocketClientService, private route: ActivatedRoute, public dialog: MatDialog) {}

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

    openDialog(gamePassword: string): void {
        const dialogRef = this.dialog.open(GamePasswordFormComponent, {
            data: { password: gamePassword },
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
            console.log('Result:', result.goodPassword);
        });
    }

    openPrivateWaiting(): void {
        this.dialog.open(PrivateGameWaitingComponent, {
            disableClose: true,
        });
    }

    joinWaitingRoom(gameToJoin: Game) {
        if (gameToJoin.password) this.openDialog(gameToJoin.password);
        else {
            gameToJoin.joinedPlayers.push(this.username);
            this.socketService.send('waiting-room-second-player', gameToJoin);
        }
    }
}
