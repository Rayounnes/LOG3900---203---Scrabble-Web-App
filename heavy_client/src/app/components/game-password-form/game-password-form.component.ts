import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-game-password-form',
    templateUrl: './game-password-form.component.html',
    styleUrls: ['./game-password-form.component.scss'],
})
export class GamePasswordFormComponent {
    inputPassword: string;
    hide: boolean = true;
    wrongPassword: boolean = false;
    langue = ""
    theme = ""
    constructor(public dialogRef: MatDialogRef<GamePasswordFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public socketService: ChatSocketClientService) {
        this.connect()
    }

    onCancelClick(): void {
        this.dialogRef.close(false);
    }

    verifyPassword(): void {
        this.wrongPassword = this.inputPassword !== this.data.password;
        if (!this.wrongPassword) {
            this.data.validPassword = true;
            this.dialogRef.close(true);
        }
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
        })
    }
}
