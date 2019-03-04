import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-new-file-dialog',
  templateUrl: './new-file-dialog.component.html',
  styleUrls: ['./new-file-dialog.component.css']
})
export class NewFileDialogComponent implements OnInit {
  
  newFile: NewFile = {
   name: '',
   ext: 'PRG'
  };

  constructor(private ref: MatDialogRef<any>) { }

  ngOnInit() {
  }
  
  create() {
    const finalName = this.newFile.name + '.' + this.newFile.ext;
    this.ref.close(finalName.toUpperCase());
  }

}

interface NewFile {
  name: string;
  ext: string;
}
