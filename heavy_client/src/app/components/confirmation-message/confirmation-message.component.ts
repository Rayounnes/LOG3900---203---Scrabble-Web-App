import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationService } from '@app/services/confirmation.service';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';

// Inspiré de  https://careydevelopment.us/blog/how-to-create-confirmation-dialog-popups-using-angular-material

@Component({
    selector: 'app-confirmation-message',
    templateUrl: './confirmation-message.component.html',
    styleUrls: ['./confirmation-message.component.scss'],
})
export class ConfirmationMessageComponent {
    title: string;
    message: string;
    constructor(
        public confirmationDialog: MatDialogRef<ConfirmationMessageComponent>,
        @Inject(MAT_DIALOG_DATA) public confirmation: ConfirmationService,
        public socketService: ChatSocketClientService,
    ) {
        this.title = confirmation.title;
        this.message = confirmation.message;
    }

    onOK(): void {
        this.confirmationDialog.close(true);
        this.socketService.send('abandon-game');
    }

    onCancel(): void {
        this.confirmationDialog.close(false);
    }
}
