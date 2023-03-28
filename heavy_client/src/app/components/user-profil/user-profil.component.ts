import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { CommunicationService } from '@app/services/communication.service';
import { UsernameEditComponent } from '@app/components/username-edit/username-edit.component';
import { AvatarSelectionComponent } from '../avatar-selection/avatar-selection.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenshotDialogComponent } from '../screenshot-dialog/screenshot-dialog.component';

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
  dialogRef : any;
  avatarChoosed : string = "";
  screenshots : string[][] = [] //[[image,commentaire],[image,commentaire]]
  dialogConfig = new MatDialogConfig();

  constructor(private communicationService : CommunicationService,
    public socketService: ChatSocketClientService,private dialog : MatDialog, private _snackBar: MatSnackBar) { 
      this.connect()
    }


  configureBaseSocketFeatures() {
    this.socketService.on('sendUsername', (uname: string) => {
        this.username = uname;
        this.getAvatar();
        this.getConnexionHistory();
        this.getScreenshots()
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

  getScreenshots(){
    this.communicationService.getUserScreenShot(this.username).subscribe((screenshots : any) =>{
      this.screenshots = screenshots
      console.log(this.screenshots)
    })
  }

  openScreenShot(image:string){
    this.dialogConfig.width = '100%';
    this.dialogConfig.height = '100%';
    this.dialogConfig.data = {image: image, hideComment : true};
    const dialogRef = this.dialog.open(ScreenshotDialogComponent, this.dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      
    });
  }

  chooseAvatar(){
    this.dialogRef = this.dialog.open(AvatarSelectionComponent,{
      width : '1500px',
      height: '750px'
    })
    const subscription = this.dialogRef.componentInstance.avatar.subscribe((avatar : string)=>{
      if(avatar){
        if(this.currentIcon !== avatar){
          this.currentIcon = avatar;
          this.communicationService.changeIcon(this.username,this.currentIcon).subscribe((isValid : boolean)=>{
            return isValid;
          })  
        }

        subscription.unsubscribe();
      }
    })

  }

  changeUsername(){
    this.dialogRef = this.dialog.open(UsernameEditComponent);

    const subscription = this.dialogRef.componentInstance.username.subscribe((newUsername : string) =>{
      if(newUsername.length > 4 && newUsername !== this.username){
        this.communicationService.changeUsername(this.username,newUsername).subscribe((isValid : boolean) =>{
          if(isValid){
            this.username = newUsername;
            this.socketService.send('change-username',newUsername)
          }else{
            this._snackBar.open(
              "Ce username est deja utilisé !",
              'Fermer',
          );
          }
        })
        subscription.unsubscribe()
      }else{
        this._snackBar.open(
          "Vous possédes deja ce username !",
          'Fermer',)
      }

    })

  }

  ngOnInit(): void {
  }

}
