import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DictionaryComponent } from '@app/components/dictionary/dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { Game } from '@app/interfaces/game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';
import { SPECIAL_CHARACTERS } from 'src/constants/special-characters';

const MIN_TIME_TURN = 30;
const MAX_TIME_TURN = 300;
@Component({
    selector: 'app-partie-multijoueur-page',
    templateUrl: './partie-multijoueur-page.component.html',
    styleUrls: ['./partie-multijoueur-page.component.scss'],
})
export class PartieMultijoueurPageComponent implements OnInit {
    game = { time: 60, dictionary: { title: 'Mon dictionnaire', fileName: 'dictionnary.json' } as Dictionary } as Game;
    dictionaries: Dictionary[] = [];
    deletedDictionary: Dictionary;
    mode: string = '';

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        public socketService: ChatSocketClientService,
        private communicationService: CommunicationService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
        this.connect();
        this.communicationService.getDictionaries().subscribe((dictionaries) => {
            this.dictionaries = dictionaries;
        });
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on('dictionary-selected', (dictionary: Dictionary) => {
            this.game.dictionary = dictionary;
        });
    }

    popUp() {
        console.log(this.socketService.socketId);
        const messageRef = this.dialog.open(DictionaryComponent, {
            width: '500px',
            closeOnNavigation: true,
            data: this.dictionaries,
        });
        messageRef.afterClosed();
    }

    async goToNextPage() {
        this.game.mode = this.mode;
        this.game.type = 'multiplayer';
        if (this.game.time < MIN_TIME_TURN) this.game.time = MIN_TIME_TURN;
        else if (this.game.time > MAX_TIME_TURN) this.game.time = MAX_TIME_TURN;
        this.socketService.send('create-game', this.game);
        this.router.navigate([`/waiting-room/${this.mode}`]);
    }

    sendInfo() {
        if (this.game.usernameOne.length === 0) return;
        this.communicationService.getDictionaries().subscribe((dictionaries) => {
            console.log(this.game.dictionary.title);
            for (const dictionary of dictionaries) {
                if (dictionary.title === this.game.dictionary.title) {
                    this.goToNextPage();
                } else this.deletedDictionary = this.game.dictionary;
            }
        });
    }

    valideUsername(username: string) {
        return !SPECIAL_CHARACTERS.test(username);
    }
}
