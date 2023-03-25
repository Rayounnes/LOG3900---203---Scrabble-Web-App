import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener,  Input,  Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChevaletService } from '@app/services/chevalet.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import * as chevaletConstants from 'src/constants/chevalet-constants';
import { ExchangeDialogComponent } from '../exchange-dialog/exchange-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Board } from '@app/classes/board';
import { Vec2 } from '@app/interfaces/vec2';
import { Letter } from '@app/interfaces/letter';
import { CdkDragDrop} from '@angular/cdk/drag-drop';
const RESERVE_START_LENGTH = 102;/* 
const CLASSNAME_INI = 'mat-typography vsc-initialized';
const CLASSNAME = 'mat-typography'; */

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
    isEndGame = false;
    reserveTilesLeft = RESERVE_START_LENGTH;
    position0: Vec2= {x: 0, y: 0};
    position1: Vec2= {x: 0, y: 0};
    position2: Vec2= {x: 0, y: 0};
    position3: Vec2= {x: 0, y: 0};
    position4: Vec2= {x: 0, y: 0};
    position5: Vec2= {x: 0, y: 0};
    position6: Vec2= {x: 0, y: 0};

    lettersExchange = '';
    items : string[] = [];
    

    dragTiles: Map<any,any> = new Map([
        ["tile0", undefined],
        ["tile1", undefined],
        ["tile2", undefined],
        ["tile3", undefined],
        ["tile4", undefined],
        ["tile5", undefined],
        ["tile6", undefined],
    ]);

    @Output() sendTileEvent = new EventEmitter<Letter>();
    @Output() removeTileEvent = new EventEmitter<Letter>();
    @Output() resetDragEvent = new EventEmitter<string>();

    @Input() boardUser: Board;

    @Input() dragUsed: string;
    dragAccepted = ['free', 'drag']




    constructor(
        public socketService: ChatSocketClientService,
        public chevaletService: ChevaletService,
        public keyboardService: KeyboardManagementService,
        public dialog : MatDialog
    ) {}/* 
    @HostListener('document:keydown', ['$event'])
    // le chargé m'a dit de mettre any car le type keyboardEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buttonDetect(event: any) {

        if ((event.target as HTMLInputElement).type === 'text') return;
        if (event.target.className === CLASSNAME_INI || event.target.className === CLASSNAME) {
            this.buttonPressed = event.key;
            this.buttonPressed = event.key;
            this.chevaletService.moveLetter(this.buttonPressed);
            this.chevaletService.selectLetterKeyboard(this.buttonPressed);
        }
    } */

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
    @HostListener('document:click', ['$event'])
    // le chargé m'a dit de mettre any car le type mouseEvent ne reconnait pas target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clickDetect(event: any) {
        if (event.target.id === 'canvas') return;
        this.chevaletService.deselectAllLetters();
    }

    ngAfterViewInit(): void {
        this.chevaletService.chevaletContext = this.chevaletCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.chevaletService.fillChevalet();
        this.chevaletService.drawChevalet();
        this.chevaletCanvas.nativeElement.focus();
        
        this.setDragMap();
        this.connect();
        

    }
    connect() {
        this.configureBaseSocketFeatures();
        this.socketService.send('draw-letters-rack');
    }

    configureBaseSocketFeatures() {
        this.socketService.on('draw-letters-rack', (letters: string[]) => {
            this.items = letters;

            this.chevaletService.updateRack(letters);
            this.chevaletLetters = letters;
            for (let i = 0; i < this.chevalet.squareNumber; i++) {
                this.chevaletService.rackArray[i].letter = this.chevaletLetters[i];
                this.items[i] = letters[i];
            };
            this.positionTiles();
        });
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketTurn = socketTurn;
            this.resetDragEvent.emit('free');
            this.positionTiles();
            

        });
        this.socketService.on('update-reserve', (reserveLength: number) => {
            this.reserveTilesLeft = reserveLength;
        });
        this.socketService.on('end-game', () => {
            this.isEndGame = true;
        });
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

    exchange() {
        this.socketService.send('exchange-command', this.lettersExchange);
        this.chevaletService.makerackTilesIn();
        this.chevaletService.deselectAllLetters();
    }
    cancel() {
        this.chevaletService.deselectAllLetters();
    }

    openExchangeDialog(){
        this.rotate()
        setTimeout(() => {
            const dialogRef = this.dialog.open(ExchangeDialogComponent, {
                width: '200px', 
                data: {rackList: this.items}
            });

            dialogRef.afterClosed().subscribe((result  )=> {
                this.lettersExchange = result;
                this.exchangePopUp(result);})
    
        // this.position0.x = 42; //42 et 1
        // this.position0.y = 1;
        
    })
}


    exchangePopUp(result: any){
        if(result !== undefined){
            this.exchange();
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
    
    onDropped(event: any){
        event.dropPoint.x = 0;
        event.dropPoint.y = 0;
    }

    getPositionDroppedX(posX: number){
        return Math.floor(((posX-20)/39)+1);
    }

    getPositionDroppedY(posY: number){
        return Math.floor(((posY+589)/39)+1);
    }
    setDragMap(){
        console.log(`boxes ${this.boxes}`)
        console.log(this.boxes)
        let tileBoxes: ElementRef<any>[] = [];
        this.boxes.forEach((box)=>{
            console.log(`unique box ${box}`)
            tileBoxes.push(box)
            console.log(`tilebox ${tileBoxes}`)
        })
        console.log(`tilebox fini  ${tileBoxes}`)
        let i = 0;
        for (let key of this.dragTiles.keys()){
            this.dragTiles.set(key,tileBoxes[i++])
        }
        console.log(`dragtil fini  ${this.dragTiles}`)
        this.positionTiles();

    }
    drop(event: CdkDragDrop<string[]>) {
        let tile = this.dragTiles.get(event.item.element.nativeElement.id);
        const keysArray = Array.from(this.dragTiles.keys())
        let posTileX = -585 + event.dropPoint.x;
        let posTileY = -691+ event.dropPoint.y;
        let letterValue = event.item.element.nativeElement.innerText;
        if(event.dropPoint.x >580 && event.dropPoint.x<1154 && event.dropPoint.y>69 &&event.dropPoint.y<650 && !this.boardUser.getIsFilled(this.getPositionDroppedY(posTileY)+1, this.getPositionDroppedX(posTileX)+1)){
            this.placeTileElement(tile, keysArray, event, letterValue);
        }
        else{
            this.backTileOnRack(tile, keysArray, event, letterValue);

        }

      }
      placeTileElement(tile:any, keysArray:string[], event:any, letterValue: any){
        let posTileX = -585 + event.dropPoint.x;
        let posTileY = -691+ event.dropPoint.y;
        if(posTileX<20){
            tile.nativeElement.style.left = `${16.25}px`;
            
        }
        else{
            tile.nativeElement.style.left = `${16.25 + 39.5 * this.getPositionDroppedX(posTileX)}px`;

        }
        if(posTileY<-589){
            tile.nativeElement.style.top = `${-602}px`;
        }
        else{
            tile.nativeElement.style.top = `${-602 + 39.5 * this.getPositionDroppedY(posTileY)}px`;

        }
        tile.nativeElement.style.width = `${39}px`;
        tile.nativeElement.style.height = `${39}px`;
        this.sendTileEvent.emit({value:letterValue, line:this.getPositionDroppedY(posTileY), column:this.getPositionDroppedX(posTileX), tileID:event.item.element.nativeElement.id});



      }
      backTileOnRack(tile:any, keysArray:string[], event:any, letterValue: any){
        let posTileX = -585 + event.dropPoint.x;
        let posTileY = -691+ event.dropPoint.y;
        tile.nativeElement.style.top = `${1}px`;
        tile.nativeElement.style.left = `${42+(71*(keysArray.indexOf(event.item.element.nativeElement.id)))}px`;
        tile.nativeElement.style.width = `${68}px`;
        tile.nativeElement.style.height = `${57}px`;
        this.removeTileEvent.emit({value:letterValue, line:this.getPositionDroppedY(posTileY), column:this.getPositionDroppedX(posTileX), tileID:event.item.element.nativeElement.id});

      }

      positionTiles(){
        this.position0.x = 42; //42 et 1
        this.position0.y = 1;

        this.position1.x = 42+71;
        this.position1.y = 1;

        this.position2.x = 42+(71*2);
        this.position2.y = 1;

        this.position3.x = 42+(71*3);
        this.position3.y = 1;

        this.position4.x = 42+(71*4);
        this.position4.y = 1;

        this.position5.x = 42+(71*5);
        this.position5.y = 1;

        this.position6.x = 42+(71*6);
        this.position6.y = 1;

        const keysArray = Array.from(this.dragTiles.keys())
        console.log(`dragtil position  ${this.dragTiles}`)
        for(let i = 0; i<7; i++){
            this.dragTiles.get(keysArray[i]).nativeElement.style.top = `${1}px`;
            this.dragTiles.get(keysArray[i]).nativeElement.style.left = `${42+(71*(i))}px`;
            this.dragTiles.get(keysArray[i]).nativeElement.style.width = `${68}px`;
            this.dragTiles.get(keysArray[i]).nativeElement.style.height = `${57}px`;
        }

      }
  

      
}
