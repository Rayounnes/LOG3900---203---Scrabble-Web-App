import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { Game } from '@app/interfaces/game';
/* import { GameHistory } from '@app/interfaces/game-historic-info'; */ /* 
import { Player } from '@app/interfaces/player'; */
/* import { PlayerState } from '@app/interfaces/player-state'; */ /* 
import { TopScore } from '@app/interfaces/top-scores'; */ /* */
import { CommunicationService } from '@app/services/communication.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import { PROFILE } from 'src/constants/profile-picture-constants';
import { GamePlayerInfos } from '@app/interfaces/game-player-infos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

const DEFAULT_CLOCK = 60;
const ONE_SECOND = 1000;
const RESERVE_START_LENGTH = 102;
@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent implements OnInit, OnDestroy {
    @ViewChild('circleProgress') circleProgress!: ElementRef<SVGElement>;
    isHost = false;
    isGameFinished = false;
    isAbandon = false;
    isRefresh = false;
    timer: ReturnType<typeof setInterval>;
    gameDuration: number = 0;
    dateAtStart: string = '';
    msgAbandoned: string = '';
    game = {
        hostUsername: 'rayan',
        humanPlayers: 3,
        isPrivate: true,
        time: 60,
        dictionary: { title: 'Mon dictionnaire', fileName: 'dictionnary.json' } as Dictionary,
    } as Game;
    players: GamePlayerInfos[] = [];
    icons: Map<string, string> = new Map<string, string>();
    paramsObject: any;
    isClassic: boolean;
    isPlayersTurn: boolean = false;
    gameTime: number = DEFAULT_CLOCK;
    clock: number = DEFAULT_CLOCK;
    reserveTilesLeft = RESERVE_START_LENGTH;
    userphotos = PROFILE;
    constructor(
        public socketService: ChatSocketClientService,
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
        private route: ActivatedRoute,
    ) {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        console.log('is classic pannel: ', this.isClassic);
    }
    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }
    @HostListener('window:beforeunload')
    saveClockBeforeRefresh() {
        if (!this.isAbandon || !this.isGameFinished) {
            sessionStorage.setItem('clock', String(this.clock));
            sessionStorage.setItem('gameDuration', String(this.gameDuration));
            sessionStorage.setItem('dateAtStart', this.dateAtStart);
        } else sessionStorage.clear();
    }
    ngOnInit(): void {
        if (sessionStorage.getItem('clock')) {
            this.dateAtStart = String(sessionStorage.getItem('dateAtStart'));
            this.gameDuration = Number(sessionStorage.getItem('gameDuration'));
            this.isRefresh = true;
            this.clock = Number(sessionStorage.getItem('clock'));
            this.timer = setInterval(() => this.intervalHandler(), ONE_SECOND);
            sessionStorage.clear();
        }
        if (!this.isRefresh) this.dateAtStart = this.getDate();
        this.connect();
    }
    ngOnDestroy(): void {
        clearInterval(this.timer);
    }
    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('update-reserve');
    }
    /* intervalHandler() {
        this.gameDuration++;
        this.clock--;
        if (this.clock === 0) {
            if (this.isPlayersTurn) this.socketService.send('remove-arrow-and-letter');
            clearInterval(this.timer);
            this.socketService.send('change-user-turn');
        }
    } */
    intervalHandler() {
        this.gameDuration++;
        this.clock--;
        this.updateProgress(this.clock / this.game.time);
        if (this.clock === 0) {
            if (this.isPlayersTurn) this.socketService.send('remove-arrow-and-letter');
            clearInterval(this.timer);
            this.socketService.send('change-user-turn');
        }
    }
    turnSockets() {
        this.socketService.on('refresh-user-turn', (playerTurnId: string) => {
            this.isPlayersTurn = playerTurnId === this.socketId;
        });
        this.socketService.on('user-turn', (playerTurnId: string) => {
            this.isPlayersTurn = playerTurnId === this.socketId;
            if (this.isClassic) {
                clearInterval(this.timer);
                this.clock = this.gameTime;
                this.resetProgressCircle();
                this.timer = setInterval(() => this.intervalHandler(), ONE_SECOND);
            }
            this.socketService.send('send-player-score');
        });
    }
    panelDisplaySockets() {
        this.socketService.on('send-info-to-panel', async (infos: any) => {
            this.players = infos.players;
            for (const player of this.players) {
                if (player.socket === infos.turnSocket) {
                    player.isTurn = true;
                } else {
                    player.isTurn = false;
                }
                if (player.socket == this.socketId) {
                    player.username += ' (You)';
                }
            }
            for (const player of this.players) {
                if (player.isVirtualPlayer) {
                    if (this.icons.get(player.username)) {
                        player.icon = this.icons.get(player.username);
                    } else {
                        await this.communicationService.getAvatar('Bottt').subscribe((icon: string[]) => {
                            if (icon.length > 0) {
                                this.icons.set(player.username, icon[0]);
                                player.icon = icon[0];
                            }
                        });
                    }
                } else {
                    if (this.icons.get(player.username)) {
                        player.icon = this.icons.get(player.username);
                    } else {
                        await this.communicationService.getAvatar(player.username.split(' ')[0]).subscribe((icon: string[]) => {
                            if (icon.length > 0) {
                                this.icons.set(player.username, icon[0]);
                                player.icon = icon[0];
                            }
                        });
                    }
                }
            }
        });
        this.socketService.on('freeze-timer', () => {
            clearInterval(this.timer);
        });
        this.socketService.on('send-game-timer', (seconds: number) => {
            this.gameTime = seconds;
        });
        this.socketService.on('update-reserve', (reserveLength: number) => {
            this.reserveTilesLeft = reserveLength;
        });
    }
    configureBaseSocketFeatures() {
        this.turnSockets();
        this.panelDisplaySockets();
        this.socketService.on('abandon-game', (abandonMessage: string) => {
            this.isAbandon = true;
            this.snackBar.open(abandonMessage, 'Fermer', {
                duration: 1000,
                panelClass: ['snackbar'],
            });
        });
        this.socketService.on('end-game', (isAbandoned: boolean) => {
            if (isAbandoned) this.isAbandon = true;
            this.isGameFinished = true;
            this.snackBar.open('La partie est terminée', 'Fermer', {
                duration: 1000,
                panelClass: ['snackbar'],
            });
            clearInterval(this.timer);
            this.addScore();
            this.addGameToHistory();
        });
    }

    addScore(): void {
        /* const mode = 'Classic';
        const firstScore: TopScore = {
            playerName: this.player.username,
            score: this.player.score,
        };
        if (this.isHost) {
            this.communicationService.bestScoresPost(firstScore, mode).subscribe();
        } */
    }

    addGameToHistory(): void {
        /* const gameMode = 'Classique';
        const gameInfo: GameHistory = {
            duration: this.getGameDuration(),
            playerName: this.player.username,
            finalScore: this.player.score,
            opponentPlayerName: this.opponent.username,
            oponnentFinalScore: this.opponent.score,
            mode: gameMode,
            date: this.dateAtStart,
            abandoned: this.msgAbandoned,
        };
        if (this.isHost) this.communicationService.gameHistoryPost(gameInfo).subscribe(); */
    }

    getDate() {
        const date = new Date();
        return date.toLocaleString();
    }

    getGameDuration() {
        const minutes = Math.floor(this.gameDuration / DEFAULT_CLOCK);
        const seconds = Math.floor(this.gameDuration - minutes * DEFAULT_CLOCK);
        return (minutes + 'min' + seconds + 'sec').toString();
    }

    updateProgress(timeFraction: number): void {
        const circle = this.circleProgress.nativeElement;
        const radius = parseFloat(circle.getAttribute('r')!);
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - timeFraction);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
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
}
