import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
@Component({
  selector: 'app-white-letter-dialog',
  templateUrl: './white-letter-dialog.component.html',
  styleUrls: ['./white-letter-dialog.component.scss']
})
export class WhiteLetterDialogComponent{
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  constructor( public dialogRef: MatDialogRef<WhiteLetterDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(letter: string): void {
    if(letter){

      this.dialogRef.close(letter);
    }
    else{
      this.dialogRef.close();
    }
  }

}
