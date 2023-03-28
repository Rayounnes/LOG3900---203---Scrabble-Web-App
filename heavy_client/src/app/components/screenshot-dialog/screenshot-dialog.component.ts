import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-screenshot-dialog',
  templateUrl: './screenshot-dialog.component.html',
  styleUrls: ['./screenshot-dialog.component.scss']
})
export class ScreenshotDialogComponent implements OnInit {
  image : string;
  comment : string = "";
  constructor(public dialogRef: MatDialogRef<ScreenshotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.image = this.data.image
    }

  save(){
    this.dialogRef.close(this.comment)
  }

  ngOnInit(): void {
  }

}
