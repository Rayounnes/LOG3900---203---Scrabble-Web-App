import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-game-password-form',
    templateUrl: './game-password-form.component.html',
    styleUrls: ['./game-password-form.component.scss'],
})
export class GamePasswordFormComponent {
    inputPassword: string;
    hide: boolean = true;
    wrongPassword: boolean = false;
    constructor(public dialogRef: MatDialogRef<GamePasswordFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

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
}
