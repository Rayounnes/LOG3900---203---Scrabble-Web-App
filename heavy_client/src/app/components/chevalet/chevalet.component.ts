import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChevaletService } from '@app/services/chevalet.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import * as chevaletConstants from 'src/constants/chevalet-constants';
import { GridConstants } from 'src/constants/grid-constants';

import { ExchangeDialogComponent } from '../exchange-dialog/exchange-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CooperativeAction } from '@app/interfaces/cooperative-action';
import { CooperativeVoteComponent } from '../cooperative-vote/cooperative-vote.component';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Command } from '@app/interfaces/command';
import { Board } from '@app/classes/board';
import { Vec2 } from '@app/interfaces/vec2';
import { Letter } from '@app/interfaces/letter';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { LETTERS_POINTS } from 'src/constants/points-constants';
import { TileDragRack } from '@app/interfaces/tile-drag-rack';
import { WhiteLetterDialogComponent } from '../white-letter-dialog/white-letter-dialog.component';

const RESERVE_START_LENGTH = 102;

@Component({
    selector: 'app-chevalet',
    templateUrl: './chevalet.component.html',
    styleUrls: ['./chevalet.component.scss'],
})
export class ChevaletComponent implements AfterViewInit {
    @ViewChild('chevaletCanvas', { static: false }) private chevaletCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('rotateBtn', { static: false }) rotateBtn!: ElementRef;
    @ViewChildren('tile1, tile2, tile3, tile4, tile5, tile6, tile7') boxes: QueryList<ElementRef>;

    buttonPressed = '';
    chevalet = new chevaletConstants.ChevaletConstants();
    chevaletLetters: string[] = [];
    display: boolean = false;
    socketTurn: string;
    paramsObject: any;
    isClassic: boolean;
    isObserver: boolean;
    isEndGame = false;
    reserveTilesLeft = RESERVE_START_LENGTH;
    position0: Vec2 = { x: 0, y: 0 };
    position1: Vec2 = { x: 0, y: 0 };
    position2: Vec2 = { x: 0, y: 0 };
    position3: Vec2 = { x: 0, y: 0 };
    position4: Vec2 = { x: 0, y: 0 };
    position5: Vec2 = { x: 0, y: 0 };
    position6: Vec2 = { x: 0, y: 0 };
    letterPoints = LETTERS_POINTS;
    lettersExchange = '';
    dialogConfig = new MatDialogConfig();
    items = [' ', ' ', ' ', ' ', ' ', ' ', ' '];
    rackX: number;
    rackY: number;
    lettersOut: TileDragRack[] = [];
    currentPixelRatio: number = window.devicePixelRatio;
    langue = ""
    theme = ""

    dragTiles: Map<any, any> = new Map([
        ['tile0', undefined],
        ['tile1', undefined],
        ['tile2', undefined],
        ['tile3', undefined],
        ['tile4', undefined],
        ['tile5', undefined],
        ['tile6', undefined],
    ]);

    @Output() sendTileEvent = new EventEmitter<Letter>();
    @Output() removeTileEvent = new EventEmitter<Letter>();
    @Output() resetDragEvent = new EventEmitter<string>();

    @Output() removeAll = new EventEmitter();
    @Input() boardUser: Board;

    @Input() canvasBoard: ElementRef<HTMLCanvasElement>;

    @Input() isBoardClicked: boolean;
    @Input() dragUsed: string;
    dragAccepted = ['free', 'drag', 'type'];
    posBoard: DOMRect;

    constructor(
        public socketService: ChatSocketClientService,
        public chevaletService: ChevaletService,
        public keyboardService: KeyboardManagementService,
        public gridConstant: GridConstants,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
    ) {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        this.isObserver = this.paramsObject.params.isObserver === 'true';
    }
    @HostListener('document:keydown', ['$event'])
    // le chargé m'a dit de mettre any car le type keyboardEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buttonDetect(event: any) {
        console.log(event);
        if (this.dragUsed === 'type') {
            if (event.key !== 'Backspace' && event.key !=='Escape') {
                console.log(event.key);
                let letter = event.key;
                if(event.key === event.key.toUpperCase()){
                    letter = '*';
                }
                let index = this.items.findIndex((item) => item === letter);
                if (index !== -1) {
                    this.items = this.items.slice(0, index).concat(' ', this.items.slice(index + 1));
                    console.log(this.items, 'new list ');
                    console.log({ position: index, value: event.key } as TileDragRack);
                    this.lettersOut.push({ position: index, value: event.key } as TileDragRack);
                }
            } else {
                if (event.key === 'Backspace' && this.lettersOut.length >= 1) {
                    this.removeLastOutLetter();
                }
                else if (event.key === 'Escape' && this.lettersOut.length >= 1) {
                    console.log("ON A APPUYER SUR LE ESCAPE")
                    this.removeAllOutLetter();
                }
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        if (window.devicePixelRatio !== this.currentPixelRatio) {
            this.currentPixelRatio = window.devicePixelRatio;
            this.posBoard = this.canvasBoard.nativeElement.getBoundingClientRect();
            this.positionTiles();
            this.removeAll.emit();

            console.log('Zoom level changed');
        }
        this.positionTiles();
        this.posBoard = this.canvasBoard.nativeElement.getBoundingClientRect();
        this.removeAll.emit();

        console.log(event);
    }
    removeAllOutLetter() {
        console.log("dans le bail");
        while (this.lettersOut.length >= 1) {

            this.removeLastOutLetter();
        }
    }
    removeLastOutLetter() {
        console.log('dans le backspace', this.lettersOut as TileDragRack[]);
        let letterOut = this.lettersOut.pop();
        console.log("la outuuuuu", letterOut);
        this.items[letterOut?.position as number] = letterOut?.value as string;
        console.log('apres supression de tuile', this.items);
    }

    @HostListener('mousewheel', ['$event'])
    // le chargé m'a dit de mettre any car le type mouseEvent ne reconnait pas wheelDelta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scroll(event: any) {
        if ((event.target as HTMLInputElement).type === 'text') return;
        const max = -1;
        const wheelDelta = Math.max(max, Math.min(1, event.wheelDelta || -event.detail));
        if (wheelDelta < 0) {
            this.chevaletService.moveLetterRight(this.chevaletService.findManipulateLetter() as number);
        }
        if (wheelDelta > 0) {
            this.chevaletService.moveLetterLeft(this.chevaletService.findManipulateLetter() as number);
        }
    }
    // @HostListener('document:click', ['$event'])
    // // le chargé m'a dit de mettre any car le type mouseEvent ne reconnait pas target
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // clickDetect(event: any) {
    //     if (event.target.id === 'canvas') return;
    //     this.removeAllOutLetter();
    //     this.chevaletService.deselectAllLetters();
    // }

    ngAfterViewInit(): void {
        if (!this.isObserver) {
            this.chevaletService.chevaletContext = this.chevaletCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.chevaletService.fillChevalet();
            this.chevaletService.drawChevalet();
            this.chevaletCanvas.nativeElement.focus();
            console.log(this.canvasBoard);
            this.setDragMap();
        }
        this.connect();
    }
    connect() {
        this.configureBaseSocketFeatures();
        if (!this.isObserver) this.socketService.send('draw-letters-rack');
        this.socketService.send('get-config');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('draw-letters-rack', (letters: string[]) => {
            this.items = letters;

            this.chevaletService.updateRack(letters);
            this.chevaletLetters = letters;
            for (let i = 0; i < this.chevalet.squareNumber; i++) {
                this.chevaletService.rackArray[i].letter = this.chevaletLetters[i];
                this.items[i] = letters[i].toLowerCase();
            }
            this.positionTiles();
        });
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketTurn = socketTurn;
            this.resetDragEvent.emit('free');
            this.positionTiles();
        });
        this.socketService.on('update-reserve', (reserveLength: number) => {
            this.reserveTilesLeft = reserveLength;
            this.positionTiles();
        });
        this.socketService.on('end-game', () => {
            this.isEndGame = true;
        });
        this.socketService.on('vote-action', (voteAction: CooperativeAction) => {
            if (voteAction.action === 'exchange') this.openExchangeVoteActionDialog(voteAction);
        });
        this.socketService.on('exchange-command', (command: Command) => {
            if (command.type === 'system') {
                if(this.langue == "fr"){
                    this.snackBar.open(command.name, 'Fermer', {
                        duration: 3000,
                        panelClass: ['snackbar'],
                    });
                }else{
                    this.snackBar.open(command.name, 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar'],
                    });
                }
                
                if (!this.isClassic) this.socketService.send('cooperative-invalid-action', false);
            } else {
                this.socketService.send('draw-letters-rack');
                if (this.isClassic) {
                    this.socketService.send('exchange-opponent-message', command.name.split(' ')[1].length);
                    this.socketService.send('change-user-turn');
                }
            }
        });
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
    }
    get width(): number {
        return this.chevalet.width + 9;
    }

    get height(): number {
        return this.chevalet.height;
    }
    /* rightMouseHitDetect(event: MouseEvent) {
        event.preventDefault();
        if (this.socketService.socketId === this.socketTurn && !this.isEndGame) this.chevaletService.changeRackTile(event);
    }
    leftMouseHitDetect(event: MouseEvent) {
        this.chevaletService.changeRackTile(event);
    } */
    openExchangeVoteActionDialog(voteAction: CooperativeAction): void {
        this.dialogConfig.position = { left: '100px' };
        this.dialogConfig.backdropClass = 'custom-backdrop';
        this.dialogConfig.panelClass = 'custom-panel';
        this.dialogConfig.width = '400px';
        this.dialogConfig.height = '600px';
        this.dialogConfig.disableClose = true;
        this.dialogConfig.data = { vote: voteAction, isObserver: this.isObserver };
        const dialogRef = this.dialog.open(CooperativeVoteComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if (result.action.socketId === this.socketService.socketId && result.isAccepted) {
                this.exchange();
            }
            const message = result.isAccepted ? 'Action accepted' : 'Action refused';
            if(this.langue == "fr"){
                this.snackBar.open(message, 'Fermer', {
                    duration: 3000,
                    panelClass: ['snackbar'],
                });
            }else{
                this.snackBar.open(message, 'Close', {
                    duration: 3000,
                    panelClass: ['snackbar'],
                });
            }
        });
    }
    exchange() {
        this.socketService.send('exchange-command', this.lettersExchange);
        this.chevaletService.makerackTilesIn();
        this.chevaletService.deselectAllLetters();
    }
    cancel() {
        this.chevaletService.deselectAllLetters();
    }

    openExchangeDialog() {
        this.rotate();
        setTimeout(() => {
            const dialogRef = this.dialog.open(ExchangeDialogComponent, {
                width: '200px',
                data: { rackList: this.items},
            });

            dialogRef.afterClosed().subscribe((result) => {
                this.lettersExchange = result;
                this.exchangePopUp(result);
            });

            // this.position0.x = 42; //42 et 1
            // this.position0.y = 1;
        });
    }

    exchangePopUp(result: any) {
        if (result !== undefined) {
            if (!this.isClassic) {
                const choiceMap: any = {};
                choiceMap[this.socketService.socketId] = 'yes';
                const voteAction = {
                    action: 'exchange',
                    socketId: this.socketService.socketId,
                    votesFor: 1,
                    votesAgainst: 0,
                    lettersToExchange: this.lettersExchange,
                    socketAndChoice: choiceMap,
                } as CooperativeAction;
                console.log(voteAction);
                this.socketService.send('vote-action', voteAction);
            } else {
                this.exchange();
            }
        }
    }

    rotate(): void {
        const btn = this.rotateBtn.nativeElement;
        btn.classList.remove('rotate-animation');

        // Use setTimeout() to ensure that the animation is reset before reapplying the class
        setTimeout(() => {
            btn.offsetWidth; // Trigger a reflow to reset the animation
            btn.classList.add('rotate-animation');
        }, 0);
    }

    onDropped(event: any) {
        event.dropPoint.x = 0;
        event.dropPoint.y = 0;
    }

    getPositionDroppedX(posX: number, firstTilePos?: any) {
        console.log(Math.floor((posX - firstTilePos) / 50));
        return Math.floor((posX - firstTilePos) / this.gridConstant.tileSize);
    }

    getPositionDroppedY(posY: number, firstTilePos?: any) {
        console.log(Math.floor(posY / this.gridConstant.tileSize));
        return Math.floor((posY - firstTilePos) / this.gridConstant.tileSize);
    }
    setDragMap() {
        console.log(`boxes ${this.boxes}`);
        console.log(this.boxes);
        let tileBoxes: ElementRef<any>[] = [];
        this.boxes.forEach((box) => {
            console.log(`unique box ${box}`);
            tileBoxes.push(box);
            console.log(`tilebox ${tileBoxes}`);
        });
        console.log(`tilebox fini  ${tileBoxes}`);
        let i = 0;
        for (let key of this.dragTiles.keys()) {
            this.dragTiles.set(key, tileBoxes[i++]);
        }
        console.log(`dragtil fini  ${this.dragTiles}`);
        this.positionTiles();
    }
    isInRange(drop: number, startBoardPos: number, posBoard: number) {
        if (drop > startBoardPos && drop < posBoard + this.gridConstant.defaultHeight) {
            return true;
            // event.dropPoint.x >startBoard.x && event.dropPoint.x < (posBoard.x+this.gridConstant.defaultHeight)
        }
        return false;
    }
    drop(event: CdkDragDrop<string[]>) {
        this.posBoard = this.canvasBoard.nativeElement.getBoundingClientRect();
        console.log('position board', this.posBoard);
        let startBoard = { x: this.posBoard.x + this.gridConstant.tileSize, y: this.posBoard.y + this.gridConstant.tileSize };

        let tile = this.dragTiles.get(event.item.element.nativeElement.id);
        console.log(tile.nativeElement.innerText.charAt(0));
        const keysArray = Array.from(this.dragTiles.keys());
        // let letterValue = event.item.element.nativeElement.innerText.charAt(0);
        let letterValue = this.items[keysArray.indexOf(event.item.element.nativeElement.id)];
        console.log('le txt', letterValue);
        // console.log("le txt 2", newVal);
        if (
            this.isInRange(event.dropPoint.x, startBoard.x, this.posBoard.x) &&
            this.isInRange(event.dropPoint.y, startBoard.y, this.posBoard.y) &&
            !this.boardUser.getIsFilled(
                this.getPositionDroppedY(event.dropPoint.y, startBoard.y) + 1,
                this.getPositionDroppedX(event.dropPoint.x, startBoard.x) + 1,
            )
        ) {
            console.log('dans board');
            this.placeTileElement(tile, event, letterValue, startBoard, keysArray.indexOf(event.item.element.nativeElement.id));
        } else {
            this.backTileOnRack(tile, event, letterValue, startBoard, keysArray.indexOf(event.item.element.nativeElement.id));
        }
    }
    placeTileElement(tile: any, event: any, letterValue: any, startBoard: any, posTileRack: number) {
        let posTileX = event.dropPoint.x;
        let posTileY = event.dropPoint.y;
        console.log('x', this.getPositionDroppedX(posTileX, startBoard.x));
        console.log('y', this.getPositionDroppedY(posTileY, startBoard.y));
        if (posTileX < startBoard.x + this.gridConstant.tileSize) {
            console.log(startBoard.x);
            tile.nativeElement.style.left = `${startBoard.x}px`; // REVOIR LA POSITION 741
        } else {
            // tile.nativeElement.style.left = `${startBoard.x + this.gridConstant.tileSize * this.getPositionDroppedX(posTileX)}px`;
            tile.nativeElement.style.left = `${startBoard.x + this.gridConstant.tileSize * this.getPositionDroppedX(posTileX, startBoard.x)}px`;
        }
        if (posTileY < startBoard.y + this.gridConstant.tileSize) {
            tile.nativeElement.style.top = `${startBoard.y}px`;
        } else {
            tile.nativeElement.style.top = `${startBoard.y + this.gridConstant.tileSize * this.getPositionDroppedY(posTileY, startBoard.y)}px`;
        }
        this.chevaletService.removeLetterOnRack(letterValue.toUpperCase(), posTileRack);
        tile.nativeElement.style.width = `${this.gridConstant.tileSize}px`;
        tile.nativeElement.style.height = `${this.gridConstant.tileSize}px`;
        if (letterValue === '*') {
            this.openWhiteDialog(posTileRack, {
                value: letterValue,
                line: this.getPositionDroppedY(posTileY, startBoard.y),
                column: this.getPositionDroppedX(posTileX, startBoard.x),
                tileID: event.item.element.nativeElement.id,
            });
        } else {
            this.sendTileEvent.emit({
                value: letterValue,
                line: this.getPositionDroppedY(posTileY, startBoard.y),
                column: this.getPositionDroppedX(posTileX, startBoard.x),
                tileID: event.item.element.nativeElement.id,
            });
        }
    }

    backTileOnRack(tile: any, event: any, letterValue: any, startBoard: any, rackTilePos: number) {
        let rackWidth = this.chevaletCanvas.nativeElement.clientWidth;
        let rackTileSize = rackWidth / 7;
        let posTileX = event.dropPoint.x;
        let posTileY = event.dropPoint.y;

        tile.nativeElement.style.top = `${this.rackY}px`;
        tile.nativeElement.style.left = `${this.rackX + rackTilePos * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2}px`;
        tile.nativeElement.style.width = `${this.gridConstant.tileSize}px`;
        tile.nativeElement.style.height = `${this.gridConstant.tileSize}px`;
        if (letterValue === letterValue.toUpperCase() || letterValue === '*') {
            this.items[rackTilePos] = '*';
        }
        this.removeTileEvent.emit({
            value: letterValue,
            line: this.getPositionDroppedY(posTileY, startBoard.y),
            column: this.getPositionDroppedX(posTileX, startBoard.x),
            tileID: event.item.element.nativeElement.id,
        });
    }

    positionTiles() {
        let lineWidth = this.chevalet.rackLineWidth;
        this.rackX = this.chevaletCanvas.nativeElement.offsetLeft;
        this.rackY = this.chevaletCanvas.nativeElement.offsetTop + lineWidth / 2;
        let rackWidth = this.chevaletCanvas.nativeElement.clientWidth;
        let rackTileSize = rackWidth / 7;
        const keysArray = Array.from(this.dragTiles.keys());

        this.position0.x = this.rackX + 0 * rackTileSize; //42 et 1
        this.position0.y = this.rackY;

        this.position1.x = this.rackX + 1 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position1.y = this.rackY;

        this.position2.x = this.rackX + 2 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position2.y = this.rackY;

        this.position3.x = this.rackX + 3 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position3.y = this.rackY;

        this.position4.x = this.rackX + 4 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position4.y = this.rackY;

        this.position5.x = this.rackX + 5 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position5.y = this.rackY;

        this.position6.x = this.rackX + 6 * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2;
        this.position6.y = this.rackY;

        for (let i = 0; i < 7; i++) {
            this.dragTiles.get(keysArray[i]).nativeElement.style.top = `${this.rackY}px`;
            this.dragTiles.get(keysArray[i]).nativeElement.style.left = `${
                this.rackX + i * rackTileSize + (rackTileSize - this.gridConstant.tileSize) / 2
            }px`; //0.5 + (rackTileSize*(i))
            this.dragTiles.get(keysArray[i]).nativeElement.style.width = `${this.gridConstant.tileSize}px`;
            this.dragTiles.get(keysArray[i]).nativeElement.style.height = `${this.gridConstant.tileSize}px`;
        }

        // }
    }

    isNotDraggable() {
        if (this.dragAccepted.includes(this.dragUsed) && this.socketService.socketId === this.socketTurn) {
            return false;
        }
        return true;
    }

    openWhiteDialog(posTileRack: number, letter: Letter) {
        setTimeout(() => {
            const dialogRef = this.dialog.open(WhiteLetterDialogComponent, {
                width: '200px',
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    letter.value = result;
                    this.items[posTileRack] = result.toUpperCase();

                    this.sendTileEvent.emit(letter);

                    console.log(result);
                }
            });
        });
    }
}
