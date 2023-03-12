import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service'; 



@Component({
  selector: 'app-avatar-selection',
  templateUrl: './avatar-selection.component.html',
  styleUrls: ['./avatar-selection.component.scss']
})
export class AvatarSelectionComponent implements OnInit {

  @Output() avatar : EventEmitter<string> = new EventEmitter<string>();
  avatars : any = [];
  username : string= "";
  selectionMade : boolean = false;
  currentIcon : string = "";

  constructor(public dialogRef : MatDialogRef<AvatarSelectionComponent>, private communicationService : CommunicationService,  private sanitizer: DomSanitizer,
    public socketService: ChatSocketClientService,) { 
    this.connect();
    
    
  }

  configureBaseSocketFeatures() {
    this.socketService.on('sendUsername', (uname: string) => {
        this.username = uname;
        this.getAllIcons();
    });;

  }

  connect() {
    this.configureBaseSocketFeatures();
    this.socketService.send('sendUsername');
    
  }

  getAllIcons(){
    this.communicationService.getAllIcons(this.socketService.socketId).subscribe((icons : string[]) =>{
      if(icons.length > 0){
        for(let icon of icons){
          this.avatars.push([this.sanitizer.bypassSecurityTrustUrl(icon),false])
        }
      }
    })
  }

  addIcon(event : any){
    const file: File = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.readAsDataURL(file);
  
      reader.onload = () => {
        const base64Img: string = reader.result as string;
        const imageType = base64Img.split(',')[0].split(':')[1].split(';')[0];
        if(imageType == 'image/png'){
          this.pushIconToDatabase(base64Img);
        }
      };
    }
  }

  pushIconToDatabase(image : string){
    let username = this.username ? this.username : this.socketService.socketId
    this.communicationService.pushIcon(image,username).subscribe((added)=>{
      if(added){
        this.avatars.push([this.sanitizer.bypassSecurityTrustUrl(image),false]);
      }
    })
  }

  iconChoosed(choice : string){
    for(let icon of this.avatars){
      if(choice == icon[0]){
        icon[1] = !icon[1] //Change selected boolean to the opposite
        console.log(icon)
        this.currentIcon = icon[1] ? icon[0]['changingThisBreaksApplicationSecurity'] : "" //Si icon[1] ( c.a.d qu'un avatar a ete sélectionné), on update la propriete
      }else{
        icon[1] = false //On s'assure que tout les autres avatar ont "Selected" a false (si jamais un autre avatar avait ete choisi avant), vu qu'on viens d'en selectionner un nouveau
      }
    }
  }

confirmSelection(){
  this.avatar.emit(this.currentIcon);
  this.dialogRef.close()
}
  
  ngOnInit(): void {
    
  }

}
