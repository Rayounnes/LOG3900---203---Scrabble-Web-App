import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GameCreationComponent } from '../game-creation/game-creation.component';

@Component({
    selector: 'app-classique-page',
    templateUrl: './classique-page.component.html',
    styleUrls: ['./classique-page.component.scss'],
})
export class ClassiquePageComponent implements OnInit {
    mode: string;
    paramsObject: any;
    constructor(public router: Router, private dialog: MatDialog, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
            console.log(this.paramsObject);
        });
        this.mode = this.paramsObject.params.isClassicMode ? 'Classique' : 'Coopératif';
    }

    createGame() {
        const dialogRef = this.dialog.open(GameCreationComponent, {
            data: {
                isClassic: this.paramsObject.params.isClassicMode,
            },
            width: 'auto',
            closeOnNavigation: true,
        });
        dialogRef.afterClosed();
    }

    navJoinGame() {
        this.router.navigate(['/joindre-partie'], { queryParams: { isClassicMode: this.paramsObject.params.isClassicMode } });
    }

    navHome() {
        this.router.navigate(['/home']);
    }
}
