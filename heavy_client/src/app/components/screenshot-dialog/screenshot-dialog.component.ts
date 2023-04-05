import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
  selector: 'app-screenshot-dialog',
  templateUrl: './screenshot-dialog.component.html',
  styleUrls: ['./screenshot-dialog.component.scss']
})
export class ScreenshotDialogComponent implements OnInit {
  image : string;
  comment : string = "";
  hideComment : boolean = false;

  langue = ""
  theme = ""

  constructor(public dialogRef: MatDialogRef<ScreenshotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private socketService : ChatSocketClientService) { 
      this.image = this.data.image
      if(this.data.hideComment){
        this.hideComment = true;
      }
    }

  save(){
    this.dialogRef.close(this.comment)
  }

  ngOnInit(): void {
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


}
