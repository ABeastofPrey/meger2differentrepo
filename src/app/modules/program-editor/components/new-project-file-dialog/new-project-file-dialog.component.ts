import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {MCFile, ApiService} from '../../../../modules/core/services/api.service';

@Component({
  selector: 'app-new-project-file-dialog',
  templateUrl: './new-project-file-dialog.component.html',
  styleUrls: ['./new-project-file-dialog.component.css']
})
export class NewProjectFileDialogComponent implements OnInit {
  
  source : string = 'mc';
  fileType : string = null;
  selectedFile : MCFile = null;
  files : MCFile[] = [];
  extensions : string = null;
  fileName : string = null;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api : ApiService,
    private snack : MatSnackBar
  ) {
    switch (data) {
      case 'Programs':
        this.fileType = 'Program';
        this.extensions = '.PRG,.UPG';
        break;
      case 'Libraries':
        this.fileType = 'Library';
        this.extensions = '.LIB,.ULB';
        break;
      case 'Other':
        this.fileType = 'File';
        this.extensions = '.DAT,.TXT,.DEF,.VAR';
        break;
    }
  }

  ngOnInit() {
    let ext = this.extensions.replace(/\./g,'');
    this.api.getFiles(ext).then(ret=>{
      this.files = ret;
    });
  }
  
  add() {
    if (this.source === 'new') {
      let fileName = this.fileName.toUpperCase();
      let index = fileName.indexOf('.');
      if (index < 0 || index === fileName.length-1)
        return this.snack.open('INVALID FILE NAME','',{duration:1500});
      let ext = fileName.substring(index+1);
      if (this.extensions.indexOf(ext) < 0)
        return this.snack.open('INVALID FILE EXTENSION (allowed:' + this.extensions + ')','DISMISS');
      this.snack.dismiss();
      this.dialogRef.close(fileName);
    } else {
      this.snack.dismiss();
      this.dialogRef.close(this.selectedFile.fileName);
    }
  }

}
