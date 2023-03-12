import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { /* ActivatedRoute */ Router } from '@angular/router'; 
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { loginInfos } from 'src/constants/login-constants';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AvatarSelectionComponent } from '../avatar-selection/avatar-selection.component';
import { MatDialog } from '@angular/material/dialog';
/* import { DomSanitizer } from '@angular/platform-browser'; */


@Component({
  selector: 'app-connexion-page',
  templateUrl: './connexion-page.component.html',
  styleUrls: ['./connexion-page.component.scss']
})
export class ConnexionPageComponent implements OnInit {

  connected : boolean = false
  accountCreation = false
  checkingConnection : boolean = false;
  username : string = ""
  password : string = ""
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  dialogRef : any;
  /* trustedUrl : any; */

  constructor(private communicationService : CommunicationService, 
    private _snackBar: MatSnackBar, /* private route: ActivatedRoute, */  private router: Router,
    public socketService: ChatSocketClientService, private dialog : MatDialog ) {
      this.connect()
  }

  myForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(this.emailPattern)
    ])
  });

  async userConnection() : Promise<void>{
    
    let loginInfos : loginInfos = {
      username : this.username,
      password : this.password
    }
    this.communicationService.userlogin(loginInfos).subscribe((connectionValid) : void =>{
      if(connectionValid){
        this.connected = true;
        this.router.navigate(['home']);
        this.socketService.send("user-connection",{username :this.username,socketId : this.socketService.socketId});
      }else{
        this._snackBar.open("Erreur lors de la connexion. Mauvais nom d'utilisateur et/ou mot de passe ou compte deja connecté. Veuillez recommencer","Fermer")
      }
    })
  
  }

  createAccount(){
    let loginInfos : loginInfos = {
      username : this.username,
      password : this.password
    }

    this.communicationService.accountCreation(loginInfos).subscribe((accountCreationValid) : void =>{
      if(accountCreationValid){
        this.connected = true;
        this.router.navigate(['home']);
        this.socketService.send("user-connection",{username :this.username,socketId : this.socketService.socketId});
      }else{
        this._snackBar.open("Erreur lors de la création du compte. Nom d'utilisateur deja utilisé. Veuillez recommencer.","Fermer")
      }
    })

  }


  changeOption(accountCreation : boolean) : void {
    this.accountCreation = accountCreation
    this.username = ""
    this.password = ""
  }

  


  connect() {
    if (!this.socketService.isSocketAlive()) {
        this.socketService.connect();
    }
  }

  chooseAvatar(){

    this.dialogRef = this.dialog.open(AvatarSelectionComponent,{
      width : '1500px',
      height: '750px'
    })
    const subscription = this.dialogRef.componentInstance.avatar.subscribe((avatars : any)=>{
      if(avatars){
        console.log(avatars)
        subscription.unsubscribe();
      }
    })

  }

  

  ngOnInit(): void {
  }

}
