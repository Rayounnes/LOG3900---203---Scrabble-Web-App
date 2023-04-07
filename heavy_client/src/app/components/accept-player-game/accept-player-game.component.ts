import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-accept-player-game',
    templateUrl: './accept-player-game.component.html',
    styleUrls: ['./accept-player-game.component.scss'],
})
export class AcceptPlayerGameComponent implements OnInit, OnDestroy {

    langue = ""
    theme = ""

    constructor(
        public dialogRef: MatDialogRef<AcceptPlayerGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { username: string },
        public socketService: ChatSocketClientService,
    ) {}

    ngOnInit(): void {
        this.connect();
    }

    ngOnDestroy(): void {
        console.log("disposing accept pplayer sockets");
        this.socketService.socket.off('left-private-player');
        this.socketService.socket.off('get-config');
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
        this.socketService.on('left-private-player', () => {
            this.dialogRef.close(null);
        });
        this.socketService.on('get-config',(config : any)=>{
            this.langue = config.langue;
            this.theme = config.theme;
        })
    }

    onAcceptClick(): void {
        this.dialogRef.close(true);
    }

    onRejectClick(): void {
        this.dialogRef.close(false);
    }
}
