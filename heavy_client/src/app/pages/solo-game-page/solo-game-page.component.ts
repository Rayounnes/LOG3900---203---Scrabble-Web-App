import { Component, OnInit } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { SoloGame } from '@app/interfaces/solo-game';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { DictionaryComponent } from '@app/components/dictionary/dictionary.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { SPECIAL_CHARACTERS } from 'src/constants/special-characters';
import { LEVEL } from 'src/constants/virtual-player-constants';
import { VPlayerLevel } from 'src/constants/virtual-player-names';

const MIN_TIME_TURN = 30;
const MAX_TIME_TURN = 300;
@Component({
    selector: 'app-solo-game-page',
    templateUrl: './solo-game-page.component.html',
    styleUrls: ['./solo-game-page.component.scss'],
})
export class SoloGamePageComponent implements OnInit {
    game = {
        virtualPlayerName: '',
        time: 60,
        dictionary: { title: 'Mon dictionnaire', fileName: 'dictionnary.json' } as Dictionary,
        difficulty: LEVEL.Beginner,
        mode: 'solo',
    } as SoloGame;
    randomVirtualName: string;
    dataSourceBeginnerVPlayerNames: string[];
    dataSourceExpertVPlayerName: string[];
    index: number;
    changeNameCount: number = 0;
    level: string = LEVEL.Beginner;
    mode: string;
    dictionaries: Dictionary[];
    deletedDictionary: Dictionary;
    isExpert = false;
    constructor(
        public router: Router,
        private route: ActivatedRoute,
        public socketService: ChatSocketClientService,
        public communicationService: CommunicationService,
        private dialog: MatDialog,
    ) {}
    ngOnInit(): void {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
        this.connect();
        this.getBeginnerLevel();
        this.getExpertLevel();
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

    onClick() {
        this.isExpert = !this.isExpert;
        setTimeout(() => {
            this.adjustDifficulty();
        }, 2);
    }

    adjustDifficulty() {
        if (this.isExpert) {
            this.level = 'Expert';
            this.setVirtualPlayerName('Expert');
        } else {
            this.level = 'Débutant';
            this.setVirtualPlayerName('Débutant');
        }
    }

    configureBaseSocketFeatures() {
        this.socketService.on('dictionary-selected', (dictionary: Dictionary) => {
            this.game.dictionary = dictionary;
        });
    }

    valideUsername(username: string) {
        return !SPECIAL_CHARACTERS.test(username);
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

    validateIfEmpty(username: string) {
        return username !== '';
    }
    setVirtualPlayerName(level: string) {
        this.game.difficulty = level;
        this.generateVirtualPlayerName();
        this.game.virtualPlayerName = this.randomVirtualName;
    }
    generateVirtualPlayerName() {
        const VIRTUAL_NAMES = this.game.difficulty === LEVEL.Beginner ? this.dataSourceBeginnerVPlayerNames : this.dataSourceExpertVPlayerName;
        do {
            const randomNameIndex = Math.floor(Math.random() * VIRTUAL_NAMES.length);
            this.randomVirtualName = VIRTUAL_NAMES[randomNameIndex];
        } while (this.game.usernameOne.toUpperCase() === this.randomVirtualName.toUpperCase());
    }
    nameModifDetection() {
        return this.changeNameCount !== 0;
    }
    goToNextPage() {
        this.game.mode = this.mode;
        this.game.type = 'solo';
        if (this.game.time < MIN_TIME_TURN) this.game.time = MIN_TIME_TURN;
        if (this.game.time > MAX_TIME_TURN) this.game.time = MAX_TIME_TURN;
        this.socketService.send('create-solo-game', this.game);
        this.router.navigate([`/game/${this.mode}`]);
    }

    startGame() {
        this.communicationService.getDictionaries().subscribe((dictionaries) => {
            console.log(this.game.dictionary.title);
            for (const dictionary of dictionaries) {
                if (dictionary.title === this.game.dictionary.title) {
                    this.goToNextPage();
                } else this.deletedDictionary = dictionary;
            }
        });
    }

    getBeginnerLevel(): void {
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Beginner).subscribe((scores) => {
            this.dataSourceBeginnerVPlayerNames = scores.map((vPlayer) => vPlayer.name);
        });
    }
    getExpertLevel(): void {
        this.communicationService.virtualPlayerNamesGet(VPlayerLevel.Expert).subscribe((scores) => {
            this.dataSourceExpertVPlayerName = scores.map((vPlayer) => vPlayer.name);
        });
    }
}
