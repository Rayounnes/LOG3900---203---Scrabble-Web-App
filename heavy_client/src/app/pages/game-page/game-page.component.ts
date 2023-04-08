import { Component, OnInit } from '@angular/core';
import { ChevaletService } from '@app/services/chevalet.service';
import { KeyboardManagementService } from '@app/services/keyboard-management.service';
import { MouseManagementService } from '@app/services/mouse-management.service';
import { GridService } from '@app/services/grid.service';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    mouse: MouseManagementService;
    keyboard: KeyboardManagementService;
    constructor(public gridService: GridService, public chevaletService: ChevaletService, public socketService: ChatSocketClientService) {
        this.mouse = new MouseManagementService(gridService);
        this.keyboard = new KeyboardManagementService(gridService, chevaletService, this.mouse, socketService);
    }


    langue = "";
    theme = "";
    ngOnInit(): void {
        this.connect();
    }
    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
        this.socketService.send('get-config')
    }
    // Le chargé m'a dit de mettre any comme type car le type MouseEvent ne reconnait pas target.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rightMouseOutsideCanvas(event: any) {
        if (event.target.id !== 'canvas') {
            event.preventDefault();
            event.stopPropagation();
            this.chevaletService.deselectAllLetters();
        }
    }
}
