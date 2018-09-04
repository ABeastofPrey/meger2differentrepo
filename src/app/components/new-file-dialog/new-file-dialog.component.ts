import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';

const maxNameLength = 12;
const allowedExtensions = ['UPG','ULB','PRG','LIB'];

@Component({
  selector: 'new-file-dialog',
  templateUrl: './new-file-dialog.component.html',
  styleUrls: ['./new-file-dialog.component.css']
})
export class NewFileDialogComponent implements OnInit {
  
  fileName : string;

  constructor(
    private snack : MatSnackBar,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  
  create() {
    var name = this.fileName.toUpperCase();
    var index = name.indexOf('.');
    let check1 = name.length === 0 || name.length > maxNameLength;
    if (this.data && this.data.ext)
      name += '.' + (<string>this.data.ext).toUpperCase();
    if (check1 || (this.data && this.data.ext && index > 0))
      return this.snack.open('Invalid File Name','',{duration:2000});
    if (index > 0) {
      let ext = name.substring(index + 1);
      if (!allowedExtensions.includes(ext)) {
        this.snack.open('Invalid File Extension .'+ext,'',{duration:2000});
        return;
      }
    }
    this.dialogRef.close(name);
  }

  ngOnInit() {
    this.fileName = '';
  }

}