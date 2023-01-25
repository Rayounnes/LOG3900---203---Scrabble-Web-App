import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-classique-page',
    templateUrl: './classique-page.component.html',
    styleUrls: ['./classique-page.component.scss'],
})
export class ClassiquePageComponent {
    mode: string;
    constructor(public router: Router, private route: ActivatedRoute) {
        this.mode = this.route.snapshot.paramMap.get('mode') as string;
    }

    navSoloGame() {
        this.router.navigate([`/solo-game/${this.mode}`]);
    }

    navMultiGame() {
        this.router.navigate([`/partie-multijoueur/${this.mode}`]);
    }

    navJoinGame() {
        this.router.navigate([`/joindre-partie/${this.mode}`]);
    }

    navHome() {
        this.router.navigate(['/home']);
    }
}
