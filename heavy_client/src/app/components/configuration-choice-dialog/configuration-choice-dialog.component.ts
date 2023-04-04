import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';

@Component({
  selector: 'app-configuration-choice-dialog',
  templateUrl: './configuration-choice-dialog.component.html',
  styleUrls: ['./configuration-choice-dialog.component.scss']
})
export class ConfigurationChoiceDialogComponent implements OnInit {

  langue : string = "";
  theme : string = "";

  constructor(public dialogRef: MatDialogRef<ConfigurationChoiceDialogComponent>,  private socketService: ChatSocketClientService) { }

  ngOnInit(): void {
    this.connect()
  }


  configureBaseSocketFeatures() {
    this.socketService.on('get-config',(choice : any)=>{
      this.langue = choice.langue;
      this.theme = choice.theme;
    })
  }

  connect() {
    this.configureBaseSocketFeatures();
    this.socketService.send('get-config');
  }

  updateConfig(){
    this.socketService.send('update-config',{langue : this.langue, theme : this.theme})
  }

}
