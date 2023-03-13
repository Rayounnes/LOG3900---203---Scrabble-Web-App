import { PopoutWindowComponent } from 'angular-opinionated-popout-window';
import { Component, ViewChild, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit{

    @ViewChild('popoutWindow') private popoutWindow: PopoutWindowComponent;
    ngAfterViewInit(): void {
        this.popoutWindow.wrapperRetainSizeOnPopout = false;
        this.popoutWindow.whiteIcon = true;
        this.popoutWindow.innerWrapperStyle = { ['height']: '400px' };
        this.popoutWindow.popIn();
        this.popoutWindow.popOut();
        document.getElementsByClassName('popoutWrapper')[0].setAttribute('style', 'display : none');
    }
}
