import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Scrabble';
    h: string;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(public router: Router, private dialog: MatDialog) {}

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

    navLogPage() {
        this.router.navigate(['/mode/LOG2990']);
    }
}
