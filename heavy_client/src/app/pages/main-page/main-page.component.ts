import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { UserProfilComponent } from '@app/components/user-profil/user-profil.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Scrabble';
    h: string;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    dialogRef : any;

    constructor(public router: Router, private dialog: MatDialog, private socketService: ChatSocketClientService) {
        this.connect();
    }

    navModePage(isClassic: boolean) {
        this.router.navigate(['/mode'], { queryParams: { isClassicMode: isClassic } });
    }

    navModeTraining() {
        this.router.navigate(['/mode-training'])
    }

    popUp() {
        const messageRef = this.dialog.open(BestScoresComponent, {
            width: 'auto',
            closeOnNavigation: true,
        });
        messageRef.afterClosed();
    }

    userDisconnect() {
        this.socketService.send('user-disconnect', this.socketService.socketId);
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        this.router.navigate(['/connexion']);
    }

    openProfile(){
        this.dialogRef = this.dialog.open(UserProfilComponent,{
            width : '45%',
            height: '70%'
        })
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }
}
