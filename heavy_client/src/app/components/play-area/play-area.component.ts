import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
import {MatDialog} from '@angular/material/dialog';
import { HintDialogComponent } from '../hint-dialog/hint-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

const THREE_SECONDS = 3000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
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
    boardClicked : boolean = false;
    // mouse: MouseManagementService;
    // keyboard: KeyboardManagementService;
    mode: string;
    isClassic: boolean;
    dialog : MatDialog;

    // le chargé m'a dit de mettre any car le type mouseEvent et keyboardEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private canvasSize: CanvasSize;
    private defaultSize: number;
    private maxSizeWord: number;
    private minSizeWord: number;
    selectedTile: string;
    selectedTileInitialPosition: { x: any; y: any; };
    position= {x: 0, y: 0};
    dragOrType = 'free';
    typeAccepted = ['free', 'type']
    firstLetterPos: Vec2;
    hintWords: WordArgs[] = [];





    constructor(
        public gridService: GridService,
        public socketService: ChatSocketClientService,
        public chevaletService: ChevaletService,
        private route: ActivatedRoute,
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
        this.mode = this.isClassic ? 'Classique' : 'Coopératif';
    }
    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if(this.buttonPressed==='Enter'){
            

            if(this.gridService.board.verifyPlacement(this.keyboard.letters)!== undefined){
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
        this.keyboard.removeAllLetters();
    }
    onTileDragStart(event: any, tile: string) {
        this.selectedTile = tile;
        this.selectedTileInitialPosition = { x: event.clientX, y: event.clientY };
        // event.source._dragRef.disabled = false; // Enable dragging
      }

      setDragFree(event: string){
        console.log(event);
        this.dragOrType = 'free';
    }


    returnRackTile(letter: Letter){
        this.keyboard.removeLetterOnBoard(letter);
        if(this.keyboard.letters.length === 0){
            this.dragOrType = 'free';
        }
    }

    receiveDroppedTile(letter: Letter){
        if (this.keyboard.verifyLetterOnBoard(letter)) {
            this.keyboard.removeLetterOnBoard(letter);
          }
        this.keyboard.addDropLettersArray(letter);
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
                this.snackBar.open(placedWord.letters, 'Fermer', {
                    duration: 2000,
                    panelClass: ['snackbar'],
                });
            } else {
                this.commandSent = true;
                this.socketService.send('remove-letters-rack', placedWord.letters);
                this.gridService.placeLetter(placedWord.letters as Letter[]);
                this.socketService.send('validate-created-words', placedWord);
            }
            this.gridService.board.resetStartTile();
            this.gridService.board.wordStarted = false;
            this.keyboard.playPressed = false;
            this.keyboard.enterPressed = false;
        });
    }
    validatePlaceSockets() {
        this.socketService.on('validate-created-words', async (placedWord: Placement) => {
            this.socketService.send('freeze-timer');
            if (placedWord.points === 0) {
                await new Promise((r) => setTimeout(r, THREE_SECONDS));
                this.snackBar.open('Erreur : les mots crées sont invalides', 'Fermer', {
                    duration: 2000,
                    panelClass: ['snackbar'],
                });
                this.gridService.removeLetter(placedWord.letters);
            } else {
                this.socketService.send('draw-letters-opponent', placedWord.letters);
                this.gridService.board.isFilledForEachLetter(placedWord.letters);
                this.gridService.board.setLetterForEachLetters(placedWord.letters);
                this.socketService.send('send-player-score');
                this.socketService.send('update-reserve');
            }
            this.commandSent = false;
            this.socketService.send('change-user-turn');
            this.socketService.send('draw-letters-rack');
        });
        this.socketService.on('draw-letters-opponent', (lettersPosition: Letter[]) => {
            this.gridService.placeLetter(lettersPosition as Letter[]);
            this.gridService.board.isFilledForEachLetter(lettersPosition as Letter[]);
            this.gridService.board.setLetterForEachLetters(lettersPosition as Letter[]);
        });
        this.socketService.on('remove-arrow-and-letter', () => {
            this.removeLetterAndArrow();
        });

    }
    // placeSockets() {
    //     this.socketService.on('verify-place-message', (placedWord: Placement) => {
    //         if (typeof placedWord.letters === 'string') {
    //             this.commandSent = false;
    //             this.removeLetterAndArrow();
    //         } else {
    //             this.commandSent = true;
    //         }
    //     });
    //     this.socketService.on('validate-created-words', (placedWord: Placement) => {
    //         if (placedWord.points === 0) setTimeout(() => (this.commandSent = false), THREE_SECONDS);
    //         else this.commandSent = false;
    //     });
    //     this.socketService.on('remove-arrow-and-letter', () => {
    //         this.removeLetterAndArrow();
    //     });
    // }
    configureBaseSocketFeatures() {
        this.verifyPlaceSocket();
        this.validatePlaceSockets();
        this.socketService.on('user-turn', (socketTurn: string) => {
            
            this.socketService.send('hint-command');

            this.socketTurn = socketTurn;
            this.dragOrType = 'free';
        });
        this.socketService.on('end-game', () => {
            this.commandSent = true;
            this.isEndGame = true;
        });
        this.socketService.on('hint-command', (hints: string) => {
            if (hints != undefined){
                this.hintWords = [];
                this.createWord(hints);
            }
            console.log(hints.split("\n"));

        });
    }

    createWord(hints: string){
        console.log(hints);
        let splitedList = hints.split("\n");
        console.log(splitedList);
        for(let command of splitedList){
            if(command === 'Ces seuls placements ont été trouvés:'){
                continue;
            }
            if(command === "Aucun placement n'a été trouvé,Essayez d'échanger vos lettres !"){
                return;
            }
            let splitedCommand = command.split(' ');

            let columnWord = Number(splitedCommand[1].substring(1,splitedCommand[1].length - 1))- 1;
            let lineWord = splitedCommand[1][0].charCodeAt(0) - 97;
            let valueWord = splitedCommand[splitedCommand.length - 1];
            let orientationWord = splitedCommand[1][splitedCommand[1].length - 1];
            console.log({line:Number(lineWord), column:columnWord, value: valueWord, orientation:orientationWord});
            console.log
            this.hintWords.push({line:lineWord, column:Number(columnWord), value: valueWord, orientation:orientationWord} as WordArgs);
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
    }
    connect() {
        this.configureBaseSocketFeatures();
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    passTurn(): void {
        this.removeLetterAndArrow();
        this.socketService.send('chatMessage', '!passer');
        this.socketService.send('pass-turn');
        this.socketService.send('change-user-turn');
    }
    mouseHitDetect(event: MouseEvent) {
        if (!this.gridService.board.wordStarted && this.socketService.socketId === this.socketTurn && !this.isEndGame) {
            console.log("fdhyeghegwg")
            this.boardClicked = true;
            this.mouse.detectOnCanvas(event);
        }
    }

    buttonPlayPressed() {

        if(this.gridService.board.verifyPlacement(this.keyboard.letters)!== undefined){
            this.keyboard.word = this.gridService.board.verifyPlacement(this.keyboard.letters) as WordArgs;
        }
        this.keyboard.buttonPlayPressed();
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

    openHintDialog(){

    const dialogRef = this.dialog.open(HintDialogComponent, {
        width: '200px', 
        data: {hints: this.hintWords}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result){
            this.placeHintWord(result);
        }
        
      });
    }

    placeHintWord(result: WordArgs){
        this.keyboard.word = result;
        this.keyboard.placeWordHint(result);
        for(let letter of result.value){
            this.chevaletService.removeLetterOnRack(letter);
        }
        this.buttonPlayPressed();
    }
}
