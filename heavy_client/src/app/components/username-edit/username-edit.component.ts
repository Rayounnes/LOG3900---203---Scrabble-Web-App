import { Component, OnInit,EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';


@Component({
  selector: 'app-username-edit',
  templateUrl: './username-edit.component.html',
  styleUrls: ['./username-edit.component.scss']
})
export class UsernameEditComponent implements OnInit {
  @Output() username: EventEmitter<string> = new EventEmitter<string>();
  newUsername : string = "";
  langue = ""
  theme = ""
  constructor(public dialogRef: MatDialogRef<UsernameEditComponent>, private socketService : ChatSocketClientService) { }


  cancel(){
    this.dialogRef.close()
  }


  sendNewUsername(){
    this.username.emit(this.newUsername);
    this.dialogRef.close();
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

  ngOnInit(): void {
    this.connect()
  }

}
