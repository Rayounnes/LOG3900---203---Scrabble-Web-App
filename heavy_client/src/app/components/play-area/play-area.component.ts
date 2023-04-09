import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Goal } from '@app/classes/goal';
import { Placement } from '@app/interfaces/placement';
import { Vec2 } from '@app/interfaces/vec2';
import { ActivatedRoute } from '@angular/router';
import { ChevaletService } from '@app/services/chevalet.service';
import { GridService } from '@app/services/grid.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { MouseManagementService } from '@app/services/mouse-management.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import * as gridConstants from 'src/constants/grid-constants';
import { CanvasSize } from '@app/interfaces/canvas-size';
import { Letter } from '@app/interfaces/letter';
import { WordArgs } from '@app/interfaces/word-args';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CooperativeAction } from '@app/interfaces/cooperative-action';
import { CooperativeVoteComponent } from '../cooperative-vote/cooperative-vote.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

const THREE_SECONDS = 3000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    canvasElement: any;

    grid = new gridConstants.GridConstants();
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    socketTurn = '';
    commandSent = false;
    paramsObject: any;
    isEndGame = false;
    publicGoals: Goal[] = [new Goal(0, '', 0), new Goal(0, '', 0)];
    privateGoal: Goal = new Goal(0, '', 0);
    privateGoalOpponent: Goal = new Goal(0, '', 0);
    size: number;
    boardClicked: boolean = false;
    // mouse: MouseManagementService;
    // keyboard: KeyboardManagementService;
    mode: string;
    isClassic: boolean;
    isObserver: boolean;

    dialogConfig = new MatDialogConfig();

    // le chargé m'a dit de mettre any car le type mouseEvent et keyboardEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private canvasSize: CanvasSize;
    private defaultSize: number;
    private maxSizeWord: number;
    private minSizeWord: number;
    selectedTile: string;
    selectedTileInitialPosition: { x: any; y: any };
    position = { x: 0, y: 0 };
    dragOrType = 'free';
    typeAccepted = ['free', 'type'];
    firstLetterPos: Vec2;
    hintWords: WordArgs[] = [];

    langue = ""
    theme = ""

    constructor(
        public gridService: GridService,
        public socketService: ChatSocketClientService,
        public chevaletService: ChevaletService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        public mouse: MouseManagementService,
        public keyboard: KeyboardManagementService,
        private snackBar: MatSnackBar,
    ) {
        // this.mouse = new MouseManagementService(gridService);
        // this.keyboard = new KeyboardManagementService(gridService, chevaletService, this.mouse, socketService);
        this.size = 25;
        this.defaultSize = 13;
        this.maxSizeWord = 28;
        this.minSizeWord = 23;
        this.canvasSize = { x: this.grid.defaultWidth, y: this.grid.defaultHeight };
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        this.isObserver = this.paramsObject.params.isObserver === 'true';
        this.mode = this.isClassic ? 'Classique' : 'Coopératif';
    }

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {

        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
            if (this.gridService.board.verifyPlacement(this.keyboard.letters) !== undefined) {
                this.keyboard.word = this.gridService.board.verifyPlacement(this.keyboard.letters) as WordArgs;
                this.dragOrType = 'free';
            }
        }
        this.dragOrType = this.keyboard.importantKey(this.buttonPressed, this.dragOrType);
        const letter = this.keyboard.verificationAccentOnE(this.buttonPressed);
        if (this.keyboard.verificationKeyboard(letter)) {
            this.keyboard.placerOneLetter(letter);
            this.chevaletService.removeLetterOnRack(letter);
        }
    }

    @HostListener('document:click', ['$event'])
    // le chargé m'a dit de mettre any car le type mouseEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clickDetect(event: any) {
        if (event.target.id === 'canvas') return;
        // console.log("removeAllLetters");
        // // this.keyboard.removeAllLetters();
        // let start = this.gridService.board.getStartTile();
        // if(start){

        //     console.log(this.gridService.board.getStartTile());
        //     this.keyboard.putOldTile(start?.x,start.y);
        //     this.gridService.board.wordStarted = false;
        //     this.dragOrType = "free";
        //     this.gridService.board.resetStartTile();
        // }
    }

    onTileDragStart(event: any, tile: string) {
        this.selectedTile = tile;
        this.selectedTileInitialPosition = { x: event.clientX, y: event.clientY };
        // event.source._dragRef.disabled = false; // Enable dragging
    }

    setDragFree(event: string) {
        this.dragOrType = 'free';
    }

    changeSizeWindow() {
        this.keyboard.removeLettersOnBoard();
    }

    returnRackTile(letter: Letter) {
        this.keyboard.removeLetterOnBoard(letter);
        if (this.keyboard.letters.length === 0) {
            this.dragOrType = 'free';
        }
    }

    receiveDroppedTile(letter: Letter) {
        if (this.keyboard.verifyLetterOnBoard(letter)) {
            this.keyboard.removeLetterOnBoard(letter);
        }
        this.keyboard.addDropLettersArray(letter);
        this.boardClicked = false;
        this.dragOrType = 'drag';
    }

    enlargeSize() {
        if (this.size < this.maxSizeWord) {
            this.gridService.changeSizeLetters(++this.size);
        }
    }

    reduceSize() {
        if (this.size > this.minSizeWord) {
            this.gridService.changeSizeLetters(--this.size);
        }
    }
    verifyPlaceSocket() {
        this.socketService.on('verify-place-message', (placedWord: Placement) => {
            if (typeof placedWord.letters === 'string') {
                this.commandSent = false;
                this.removeLetterAndArrow();
                if(this.langue == "fr"){
                    this.snackBar.open(placedWord.letters, 'Fermer', {
                        duration: 2000,
                        panelClass: ['snackbar'],
                    });
                }else{
                    this.snackBar.open(placedWord.letters, 'Close', {
                        duration: 2000,
                        panelClass: ['snackbar'],
                    });
                }
                
            } else {
                if (this.isClassic) {
                    this.commandSent = true;
                    this.socketService.send('remove-letters-rack', placedWord.letters);
                    this.gridService.placeLetter(placedWord.letters as Letter[]);
                    this.socketService.send('validate-created-words', placedWord);
                } else {
                    const choiceMap: any = {};
                    choiceMap[this.socketService.socketId] = 'yes';
                    const voteAction = {
                        action: 'place',
                        placement: placedWord,
                        socketId: this.socketService.socketId,
                        votesFor: 1,
                        votesAgainst: 0,
                        socketAndChoice: choiceMap,
                    } as CooperativeAction;
                    this.socketService.send('vote-action', voteAction);
                }
            }
            this.gridService.board.resetStartTile();
            this.gridService.board.wordStarted = false;
            this.keyboard.playPressed = false;
            this.keyboard.enterPressed = false;
        });
    }
    validatePlacement(placement: Placement, isClassicMode: boolean) {
        this.socketService.send('draw-letters-opponent', placement.letters);
        if (isClassicMode) {
            this.gridService.board.isFilledForEachLetter(placement.letters);
            this.gridService.board.setLetterForEachLetters(placement.letters);
        }
        this.socketService.send('send-player-score');
        this.socketService.send('update-reserve');
    }
    validatePlaceSockets() {
        this.socketService.on('validate-created-words', async (placedWord: Placement) => {
            if (this.isClassic) this.socketService.send('freeze-timer');
            if (placedWord.points === 0) {
                await new Promise((r) => setTimeout(r, THREE_SECONDS));
                if(this.langue == "fr"){
                    this.snackBar.open('Erreur : les mots crées sont invalides', 'Fermer', {
                        duration: 2000,
                        panelClass: ['snackbar'],
                    });
                }else{
                    this.snackBar.open('Error : the created words are invalid', 'Close', {
                        duration: 2000,
                        panelClass: ['snackbar'],
                    });
                }
                
                if (!this.isClassic) this.socketService.send('cooperative-invalid-action', true);
                this.gridService.removeLetter(placedWord.letters);
            } else {
                this.validatePlacement(placedWord, this.isClassic);
            }
            this.commandSent = false;
            this.socketService.send('change-user-turn');
            console.log("socket validatePlaceSocket")
            this.socketService.send('draw-letters-rack');
        });
        this.socketService.on('draw-letters-opponent', (lettersPosition: Letter[]) => {
            this.gridService.placeLetter(lettersPosition as Letter[]);
            this.gridService.board.isFilledForEachLetter(lettersPosition as Letter[]);
            this.gridService.board.setLetterForEachLetters(lettersPosition as Letter[]);
            console.log("socket drawlettersopponent")

            if (!this.isClassic) this.socketService.send('draw-letters-rack');
        });
        this.socketService.on('remove-arrow-and-letter', () => {
            this.removeLetterAndArrow();
        });
        this.socketService.on('vote-action', (voteAction: CooperativeAction) => {
            if (voteAction.action !== 'exchange') this.openVoteActionDialog(voteAction);
        });
        this.socketService.on('cooperative-invalid-action', (isPlacement: boolean) => {
            let message = ""
            if(this.langue == "fr"){
                message = isPlacement
                ? 'Erreur : les mots crées sont invalides'
                : 'Commande impossible a réaliser : le nombre de lettres dans la réserve est insuffisant';
            }else{
                message = isPlacement
                ? 'Error : Created words are invalid'
                : 'Impossible : not enough letters in stock';
            }
            
            this.snackBar.open(message, 'Fermer', {
                duration: 2000,
                panelClass: ['snackbar'],
            });
        });
        this.socketService.on('player-action', (message: string) => {
            this.snackBar.open(message, 'Fermer', {
                duration: 2000,
                panelClass: ['snackbar'],
            });
        });
    }
    openVoteActionDialog(voteAction: CooperativeAction): void {
        this.dialogConfig.position = { left: '100px' };
        this.dialogConfig.backdropClass = 'custom-backdrop';
        this.dialogConfig.panelClass = 'custom-panel';
        this.dialogConfig.width = '400px';
        this.dialogConfig.height = '600px';
        this.dialogConfig.disableClose = true;
        this.dialogConfig.data = { vote: voteAction, isObserver: this.isObserver };
        const dialogRef = this.dialog.open(CooperativeVoteComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if (result.action.action === 'place' && result.action.socketId === this.socketService.socketId)
                this.removeLetterAndArrowCoop(result.action.placement.letters);
            else this.removeLetterAndArrow();
            // if (result.action.socketId === this.socketService.socketId) this.gridService.removeLetter(result.action.placement.letters);
            if (result.action.socketId === this.socketService.socketId && result.isAccepted) {
                if (result.action.action === 'place') {
                    /* this.validatePlacement(result.action.placement, this.isClassic); */
                    this.commandSent = true;
                    this.socketService.send('remove-letters-rack', result.action.placement.letters);
                    this.gridService.placeLetter(result.action.placement.letters as Letter[]);
                    this.socketService.send('validate-created-words', result.action.placement);
                } else if (result.action.action === 'pass') {
                    this.socketService.send('pass-turn');
                }
            }
            let message = ""
            if(this.langue == "en"){
                message = result.isAccepted ? 'Action accepted' : 'Action refused';
            }else{
                message = result.isAccepted ? 'Action acceptée' : 'Action refusée';
            }
            
            this.snackBar.open(message, 'Fermer', {
                duration: 3000,
                panelClass: ['snackbar'],
            });
        });
    }
    ngOnDestroy(): void {
        this.socketService.socket.off('verify-place-message');
        this.socketService.socket.off('validate-created-words');
        this.socketService.socket.off('draw-letters-opponent');
        this.socketService.socket.off('remove-arrow-and-letter');
        this.socketService.socket.off('vote-action');
        this.socketService.socket.off('cooperative-invalid-action');
        this.socketService.socket.off('player-action');

        this.socketService.socket.off('user-turn');
        this.socketService.socket.off('hint-cooperative');
        this.socketService.socket.off('end-game');
        this.socketService.socket.off('hint-command');
        this.socketService.socket.off('get-config');
    }
    configureBaseSocketFeatures() {
        this.verifyPlaceSocket();
        this.validatePlaceSockets();
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketService.send('hint-command');

            this.socketTurn = socketTurn;
            this.dragOrType = 'free';
        });
        this.socketService.on('hint-cooperative', () => {
            this.socketService.send('hint-command');
            this.dragOrType = 'free';
        });
        this.socketService.on('end-game', () => {
            this.commandSent = true;
            this.isEndGame = true;
        });
        this.socketService.on('hint-command', (hints: Placement[]) => {
            if (hints != undefined) {
                this.hintWords = [];
                this.createWord(hints);
            }
        });
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
    }

    createWord(hints: Placement[]) {
        for (let hint of hints) {
            // let splitedList = hint.command.split("\n");

            if (hint.command === 'Ces seuls placements ont été trouvés:') {
                continue;
            }
            if (hint.command === "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !") {
                return;
            }
            let splitedCommand = hint.command.split(' ');

            let columnWord = Number(splitedCommand[1].substring(1, splitedCommand[1].length - 1)) - 1;
            let lineWord = splitedCommand[1][0].charCodeAt(0) - 97;
            let valueWord = splitedCommand[splitedCommand.length - 1];
            let orientationWord = splitedCommand[1][splitedCommand[1].length - 1];
            this.hintWords.push({
                line: lineWord,
                column: Number(columnWord),
                value: valueWord,
                orientation: orientationWord,
                points: hint.points,
            } as WordArgs);
        }
    }
    ngOnInit(): void {
        this.connect();
    }
    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.buildBoard(this.defaultSize);
        this.gridService.fillPositions();
        /* this.gridService.drawPosition(); */
        this.gridCanvas.nativeElement.focus();
        this.canvasElement = this.gridCanvas;
    }
    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('get-config')
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    passTurn(): void {
        this.removeLetterAndArrow();
        // this.socketService.send('chatMessage', '!passer');
        if (this.isClassic) {
            this.socketService.send('pass-turn');
            this.socketService.send('change-user-turn');
        } else {
            const choiceMap: any = {};
            choiceMap[this.socketService.socketId] = 'yes';
            const voteAction = {
                action: 'pass',
                socketId: this.socketService.socketId,
                votesFor: 1,
                votesAgainst: 0,
                socketAndChoice: choiceMap,
            } as CooperativeAction;
            this.socketService.send('vote-action', voteAction);
        }
    }
    mouseHitDetect(event: MouseEvent) {
        const isSocketTurn = this.socketService.socketId === this.socketTurn;
        const validMouseHit = this.isClassic ? isSocketTurn && !this.isEndGame : !this.isEndGame;
        if (!this.gridService.board.wordStarted && validMouseHit && this.typeAccepted.includes(this.dragOrType)) {
            this.boardClicked = true;
            this.mouse.detectOnCanvas(event);
            this.dragOrType = 'type';
        }
    }

    buttonPlayPressed() {
        if (this.gridService.board.verifyPlacement(this.keyboard.letters) !== undefined) {
            this.keyboard.word = this.gridService.board.verifyPlacement(this.keyboard.letters) as WordArgs;
        }
        this.keyboard.buttonPlayPressed();
        this.chevaletService.makerackTilesIn();
    }

    removeLetterAndArrowCoop(letters: Letter[]) {
        this.keyboard.removeArrowAfterPlacement({ x: this.keyboard.word.line, y: this.keyboard.word.column }, this.keyboard.word.orientation);
        this.gridService.removeLetter(letters);
        this.keyboard.createTemporaryRack();
        this.keyboard.word = { line: 0, column: 0, orientation: '', value: '' };
        this.keyboard.letters = [];
        this.gridService.board.wordStarted = false;
        this.chevaletService.makerackTilesIn();
    }

    removeLetterAndArrow() {
        this.keyboard.removeArrowAfterPlacement({ x: this.keyboard.word.line, y: this.keyboard.word.column }, this.keyboard.word.orientation);
        this.gridService.removeLetter(this.keyboard.letters);
        this.socketService.send('draw-letters-rack');
        this.keyboard.createTemporaryRack();
        this.keyboard.word = { line: 0, column: 0, orientation: '', value: '' };
        this.keyboard.letters = [];
        this.gridService.board.wordStarted = false;
        this.chevaletService.makerackTilesIn();
    }

    openHintDialog() {
        const dialogRef = this.dialog.open(HintDialogComponent, {
            width: '200px',
            data: { hints: this.hintWords },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.placeHintWord(result);
            }
        });
    }

    placeHintWord(result: WordArgs) {
        this.keyboard.word = result;
        this.keyboard.placeWordHint(result);
        for (let letter of result.value) {
            this.chevaletService.removeLetterOnRack(letter);
        }
        this.buttonPlayPressed();
    }
}
