import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GameCreationComponent } from '../game-creation/game-creation.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-classique-page',
    templateUrl: './classique-page.component.html',
    styleUrls: ['./classique-page.component.scss'],
})
export class ClassiquePageComponent implements OnInit {
    mode: string;
    isClassic: boolean;
    paramsObject: any;
    langue = ""
    theme = ""
    constructor(public router: Router, private dialog: MatDialog, private route: ActivatedRoute, private socketService : ChatSocketClientService) {
        
    }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
        });
        this.isClassic = this.paramsObject.params.isClassicMode === 'true';
        this.connect()
        
    }

    createGame() {
        const dialogRef = this.dialog.open(GameCreationComponent, {
            data: {
                isClassic: this.isClassic,
            },
            width: 'auto',
            closeOnNavigation: true,
        });
        dialogRef.afterClosed();
    }

    navJoinGame() {
        this.router.navigate(['/joindre-partie'], { queryParams: { isClassicMode: this.isClassic } });
    }

    navHome() {
        this.router.navigate(['/home']);
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.configureBaseSocketFeatures();
        this.socketService.send('get-config')
    }

    configureBaseSocketFeatures() {
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
            if(this.langue == "fr"){
                this.mode = this.isClassic ? 'Classique' : 'Coopératif';
            }else{
                this.mode = this.isClassic ? 'Classic' : 'Cooperative';
            }
        })
    }
}
