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
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Letter } from '@app/interfaces/letter';
import { WordArgs } from '@app/interfaces/word-args';
import {MatDialog} from '@angular/material/dialog';
import { ExchangeDialogComponent } from '../exchange-dialog/exchange-dialog.component';
const THREE_SECONDS = 3000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    boardItems: string[] = [];
    boardRows: string[][] = [];
    cellSize = 39.6875;
    @ViewChild('canvasDropList') canvasDropList: ElementRef;
    rackItems = ['f','g','h'];
    grid = new gridConstants.GridConstants();
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    socketTurn = '';
    commandSent = false;
    isEndGame = false;
    publicGoals: Goal[] = [new Goal(0, '', 0), new Goal(0, '', 0)];
    privateGoal: Goal = new Goal(0, '', 0);
    privateGoalOpponent: Goal = new Goal(0, '', 0);
    size: number;
    // mouse: MouseManagementService;
    // keyboard: KeyboardManagementService;
    mode: string;

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




    constructor(
        private gridService: GridService,
        public socketService: ChatSocketClientService,
        public chevaletService: ChevaletService,
        private route: ActivatedRoute,
        public mouse: MouseManagementService,
        public keyboard: KeyboardManagementService,
        public dialog: MatDialog,
    ) {
        // this.mouse = new MouseManagementService(gridService);
        // this.keyboard = new KeyboardManagementService(gridService, chevaletService, this.mouse, socketService);
        this.size = 25;
        this.defaultSize = 13;
        this.maxSizeWord = 28;
        this.minSizeWord = 23;
        this.canvasSize = { x: this.grid.defaultWidth, y: this.grid.defaultHeight };
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
        for (let i = 0; i < 15; i++) {
            const row: string[] = [];
            for (let j = 0; j < 15; j++) {
              row.push('dddd');
            }
            this.boardRows.push(row);
          }
    }
    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if(this.buttonPressed==='Enter'){
            

            if( this.dragOrType === 'drag' && this.gridService.board.verifyPlacement(this.keyboard.letters)!== undefined){
    
                this.keyboard.word = this.gridService.board.verifyPlacement(this.keyboard.letters) as WordArgs;
                console.log(this.keyboard.word);
                this.dragOrType = 'free';
            }

        }
        this.keyboard.importantKey(this.buttonPressed);
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
        console.log(event);
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
    }
    receiveDroppedTile(letter: Letter){
        if (this.keyboard.verifyLetterOnBoard(letter)) {
            this.keyboard.removeLetterOnBoard(letter);
          }
        this.keyboard.addDropLettersArray(letter);
        this.dragOrType = 'drag';
    }

    onDragEnded(event: CdkDragEnd){
        console.log(event);
        this.position = { x: 200, y: 400 };

    }


      drop(event: CdkDragDrop<string[]>) {
        console.log('in the drop');
        if (event.previousContainer === event.container) {
            console.log(event.previousContainer);
            console.log(event.container);

            console.log('in the canvas');
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
        }
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
    goalsSockets() {
        this.socketService.on('public-goals', (goals: Goal[]) => {
            this.publicGoals = goals;
        });
        this.socketService.on('private-goal', (goal: Goal) => {
            this.privateGoal = goal;
        });
        this.socketService.on('private-goal-opponent', (goal: Goal) => {
            this.privateGoalOpponent = goal;
        });
    }
    placeSockets() {
        this.socketService.on('verify-place-message', (placedWord: Placement) => {
            if (typeof placedWord.letters === 'string') {
                this.commandSent = false;
                this.removeLetterAndArrow();
            } else {
                this.commandSent = true;
            }
        });
        this.socketService.on('validate-created-words', (placedWord: Placement) => {
            if (placedWord.points === 0) setTimeout(() => (this.commandSent = false), THREE_SECONDS);
            else this.commandSent = false;
        });
        this.socketService.on('remove-arrow-and-letter', () => {
            this.removeLetterAndArrow();
        });
    }
    configureBaseSocketFeatures() {
        this.goalsSockets();
        this.placeSockets();
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketTurn = socketTurn;
            this.dragOrType;
        });
        this.socketService.on('end-game', () => {
            this.commandSent = true;
            this.isEndGame = true;
        });
    }
    ngOnInit(): void {
        this.connect();
    }
    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.buildBoard(this.defaultSize);
        this.gridService.fillPositions();
        this.gridService.drawPosition();
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
        this.dragOrType = 'free';

    }
    mouseHitDetect(event: MouseEvent) {                           // draw arrow if turn and worstarted
        if (!this.gridService.board.wordStarted && this.socketService.socketId === this.socketTurn && !this.isEndGame && this.typeAccepted.includes(this.dragOrType)) {
            this.mouse.detectOnCanvas(event);
            this.dragOrType = 'type';
        }
    }

    buttonPlayPressed() {

        if(this.dragOrType === 'drag' && this.gridService.board.verifyPlacement(this.keyboard.letters)!== undefined){
            this.keyboard.word = this.gridService.board.verifyPlacement(this.keyboard.letters) as WordArgs;
        }
        console.log("the word", this.keyboard.word);
        this.keyboard.buttonPlayPressed();
        this.chevaletService.makerackTilesIn();
        this.dragOrType = 'free';
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

    openExchangeDialog(){
        const dialogRef = this.dialog.open(ExchangeDialogComponent, {
            width: '250px',
            data: {rackList: this.rackItems}
          });
      
          dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            
          });
        }
    

}
