import { PopoutWindowComponent } from 'angular-opinionated-popout-window';
import { Component, ViewChild } from '@angular/core';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent{
    @ViewChild('popoutWindow', { static: false }) private popoutWindow: PopoutWindowComponent;
    chatBoxVisible: boolean = false;

    constructor(public socketService: ChatSocketClientService){}

    initiatePopout(): void {
        this.chatBoxVisible = true;
        setTimeout(() => this.popOutParams(), 0);
    }

    popOutParams(): void {
        if (!this.popoutWindow.isPoppedOut) {
            this.popoutWindow.wrapperRetainSizeOnPopout = false;
            this.popoutWindow.whiteIcon = true;
            this.popoutWindow.innerWrapperStyle = { ['height']: '400px' };
            this.popoutWindow.popIn();
            this.popoutWindow.popOut();
            document.getElementsByClassName('popoutWrapper')[0].setAttribute('style', 'display : none');

            this.popoutWindow.closed.subscribe((isClosed) => {
                if (isClosed) {
                    this.popoutWindow.popOut();
                }
            });
        }
    }
}
