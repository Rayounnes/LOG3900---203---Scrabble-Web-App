import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { PopoutWindowComponent } from 'angular-opinionated-popout-window';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements AfterViewInit {
    @ViewChild('popoutWindow') private popoutWindow: PopoutWindowComponent;
    readonly title: string = 'Scrabble';
    h: string;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(public router: Router, private dialog: MatDialog, private socketService: ChatSocketClientService) {
        this.connect();
    }

    navModePage(isClassic: boolean) {
        this.router.navigate(['/mode'], { queryParams: { isClassicMode: isClassic } });
    }

    ngAfterViewInit(): void {
        this.popoutWindow.wrapperRetainSizeOnPopout = false;
        this.popoutWindow.whiteIcon = true;
        this.popoutWindow.innerWrapperStyle = { ['height']: '400px' };
        this.popoutWindow.popIn();
        this.popoutWindow.popOut();
        document.getElementsByClassName('popoutWrapper')[0].setAttribute('style', 'display : none');
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
        this.router.navigate(['/connexion']);
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }
}
