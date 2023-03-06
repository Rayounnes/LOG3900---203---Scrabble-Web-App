import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Dictionary } from '@app/interfaces/dictionary';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

const FRENCH_DICTIONARY = { title: 'Francais', fileName: 'dictionnary.json' } as Dictionary;
const ENGLISH_DICTIONARY = { title: 'Anglais', fileName: 'english.json' } as Dictionary;

@Component({
    selector: 'app-game-creation',
    templateUrl: './game-creation.component.html',
    styleUrls: ['./game-creation.component.scss'],
})
export class GameCreationComponent implements OnInit {
    frenchDictionary = FRENCH_DICTIONARY;
    englishDictionary = ENGLISH_DICTIONARY;
    game = {
        hostUsername: '',
        isPrivate: false,
        isFullPlayers: false,
        password: '',
        humanPlayers: 2,
        observers: 0,
        virtualPlayers: 0,
        playersWaiting: 0,
        time: 60,
    } as Game;
    dictionaries: Dictionary[] = [];
    hide: boolean = true;
    hostusername: string = '';
    publicParty: boolean = false;

    constructor(
        public router: Router,
        public dialogRef: MatDialogRef<GameCreationComponent>,
        public socketService: ChatSocketClientService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

    ngOnInit(): void {
        this.game.dictionary = FRENCH_DICTIONARY;
        this.connect();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureBaseSocketFeatures();
        this.socketService.send('sendUsername');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('sendUsername', (uname: string) => {
            this.hostusername = uname;
        });
    }
    createGame() {
        if (this.game.time < 30 || this.game.time > 300) return;
        if (this.game.humanPlayers < 2 || this.game.humanPlayers > 4) return;
        this.game.isClassicMode = this.data.isClassic;
        this.game.hostUsername = this.hostusername;
        this.game.joinedPlayers = [];
        this.game.joinedObservers = [];
        this.game.virtualPlayers = 4 - this.game.humanPlayers;
        this.dialogRef.close();
        this.socketService.send('create-game', this.game);
        this.router.navigate(['/waiting-room'], { queryParams: { isClassicMode: this.data.isClassic } });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
