import { Component, OnInit } from '@angular/core';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.scss']
})
export class UserProfilComponent implements OnInit {

  username : string = "";
  currentIcon : string = "";
  currentCategory : string = "Parties";
  connexionHistory : any[] = [];

  constructor(private communicationService : CommunicationService,
    public socketService: ChatSocketClientService) { 
      this.connect()
    }


  configureBaseSocketFeatures() {
    this.socketService.on('sendUsername', (uname: string) => {
        this.username = uname;
        this.getAvatar();
        this.getConnexionHistory();
    });;

  }

  connect() {
    this.configureBaseSocketFeatures();
    this.socketService.send('sendUsername');
    
  }

  getAvatar(){
    this.communicationService.getAvatar(this.username).subscribe((icon : string[])=>{
      if(icon.length>0){
        this.currentIcon = icon[0];
      }
    })
  }

  changeCategory(newCategory : string){
    this.currentCategory = newCategory;
  }

  getConnexionHistory(){
    this.communicationService.getUserConnexions(this.username).subscribe((history : any[])=>{
      this.connexionHistory = history.reverse()
    })
  }

  ngOnInit(): void {
  }

}
