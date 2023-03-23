import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ChevaletService } from '@app/services/chevalet.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
import * as chevaletConstants from 'src/constants/chevalet-constants';
import { ExchangeDialogComponent } from '../exchange-dialog/exchange-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    buttonPressed = '';
    chevalet = new chevaletConstants.ChevaletConstants();
    chevaletLetters: string[] = [];
    display: boolean = false;
    socketTurn: string;
    isEndGame = false;
    reserveTilesLeft = RESERVE_START_LENGTH;
    lettersExchange = '';
    items : string[] = [];
    

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
            }
        });
        // pour voir si c'est son tour : this.socketTurn === this.socketService.socketId
        this.socketService.on('user-turn', (socketTurn: string) => {
            this.socketTurn = socketTurn;
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
                console.log(result)
                this.lettersExchange = result;
                this.exchangePopUp(result);

            });
        }, 600);
        // this.position0.x = 42; //42 et 1
        // this.position0.y = 1;
        
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
    
}
