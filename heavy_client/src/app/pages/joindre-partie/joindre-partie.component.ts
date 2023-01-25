import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { SPECIAL_CHARACTERS } from 'src/constants/special-characters';
import { ActivatedRoute } from '@angular/router';

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
    mode: string;
    constructor(public socketService: ChatSocketClientService, private route: ActivatedRoute) {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
    }

    ngOnInit(): void {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
        this.connect();
        this.socketService.send('update-joinable-matches', this.mode);
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
    toggleUsernameForm(i: number) {
        this.clearOpenedToggles();
        this.openedGameWindow.push(i);
        this.displayUsernameFormGame[i] = !this.displayUsernameFormGame[i];
    }
    joinWaitingRoom(gameToJoin: Game) {
        gameToJoin.usernameTwo = this.username;
        this.socketService.send('waiting-room-second-player', gameToJoin);
    }

    valideUsername(username: string) {
        return !SPECIAL_CHARACTERS.test(username);
    }

    joinRandomGame() {
        this.clearOpenedToggles();
        const randomGameIndex = Math.floor(Math.random() * this.gameList.length);
        this.toggleUsernameForm(randomGameIndex);
        this.openedGameWindow.push(randomGameIndex);
        this.click = !this.click;
    }

    cancelToggle(i: number) {
        this.displayUsernameFormGame[i] = !this.displayUsernameFormGame[i];
    }

    clearOpenedToggles() {
        for (const game of this.openedGameWindow) this.displayUsernameFormGame[game] = false;
    }
}
