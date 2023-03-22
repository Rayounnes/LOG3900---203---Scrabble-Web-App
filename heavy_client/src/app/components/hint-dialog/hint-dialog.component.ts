import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { WordArgs } from '@app/interfaces/word-args';

@Component({
  selector: 'app-hint-dialog',
  templateUrl: './hint-dialog.component.html',
  styleUrls: ['./hint-dialog.component.scss']
})
export class HintDialogComponent {


  items: WordArgs[] = this.data.hints;

  

  constructor(    public dialogRef: MatDialogRef<HintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(word?: WordArgs): void {
      if(word){

        this.dialogRef.close(word);
      }
      else{
        this.dialogRef.close();
      }
    }
}
