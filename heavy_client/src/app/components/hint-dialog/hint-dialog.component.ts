import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { WordArgs } from '@app/interfaces/word-args';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
  selector: 'app-hint-dialog',
  templateUrl: './hint-dialog.component.html',
  styleUrls: ['./hint-dialog.component.scss']
})
export class HintDialogComponent {

  langue = ""
  theme = ""
  items: WordArgs[] = this.data.hints;

  

  constructor(    public dialogRef: MatDialogRef<HintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private socketService : ChatSocketClientService) {
      this.connect()
     }


  connect() {
    if (!this.socketService.isSocketAlive()) {
        this.socketService.connect();
        this.configureBaseSocketFeatures();
    }
    this.configureBaseSocketFeatures();
    this.socketService.send('get-config')
  }

  configureBaseSocketFeatures() {
      this.socketService.on('get-config',(config : any)=>{
          this.langue = config.langue;
          this.theme = config.theme;
      })
  }

  onNoClick(word?: WordArgs): void {
    if(word){

      this.dialogRef.close(word);
    }
    else{
      this.dialogRef.close();
    }
  }
}
