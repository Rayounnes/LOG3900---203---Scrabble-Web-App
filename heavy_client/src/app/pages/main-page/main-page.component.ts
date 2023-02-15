import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Scrabble';
    h: string;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(public router: Router, private dialog: MatDialog, private socketService : ChatSocketClientService) {
        this.connect();
    }

    navClassicPage() {
        this.router.navigate(['/mode/classic']);
    }

    popUp() {
        const messageRef = this.dialog.open(BestScoresComponent, {
            width: 'auto',
            closeOnNavigation: true,
        });
        messageRef.afterClosed();
    }

    userDisconnect(){
        this.socketService.send("user-disconnect",this.socketService.socketId);
        this.router.navigate(['/connexion'])
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }

    navLogPage() {
        this.router.navigate(['/mode/LOG2990']);
    }
}
