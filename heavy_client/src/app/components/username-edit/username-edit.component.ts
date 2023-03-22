import { Component, OnInit,EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-username-edit',
  templateUrl: './username-edit.component.html',
  styleUrls: ['./username-edit.component.scss']
})
export class UsernameEditComponent implements OnInit {
  @Output() username: EventEmitter<string> = new EventEmitter<string>();
  newUsername : string = "";
  constructor(public dialogRef: MatDialogRef<UsernameEditComponent>) { }


  cancel(){
    this.dialogRef.close()
  }


  sendNewUsername(){
    this.username.emit(this.newUsername);
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
