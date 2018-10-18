import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSort, MatTableDataSource, MatSnackBar, MatDialog} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {YesNoDialogComponent} from '../../components/yes-no-dialog/yes-no-dialog.component';
import {ApiService, MCFile, UploadResult} from '../../modules/core/services/api.service';

@Component({
  selector: 'file-mngr',
  templateUrl: './file-mngr.component.html',
  styleUrls: ['./file-mngr.component.css']
})
export class FileMngrComponent implements OnInit {
  
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  selection:SelectionModel<MCFile>=new SelectionModel<MCFile>(true,[]);
  isInit: boolean = false;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('upload') uploadInput: ElementRef;

  constructor(
    private snack : MatSnackBar,
    private dialog : MatDialog,
    private api : ApiService
  ) {
  }
  
  refreshFiles() {
    return this.api.getFiles().then((ret:MCFile[])=>{
      this.dataSource.data = ret;
      this.selection.clear();
    });
  }

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    this.refreshFiles().then(()=>{
      this.dataSource.sort = this.sort;
      this.isInit = true;
    });
  }
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row:MCFile) => this.selection.select(row));
  }
  
  onUploadFilesChange(e:any) {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Are you sure?',
        msg: 'Notice: The selected files will OVERWRITE existing files.',
        yes: 'UPLOAD',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (!ret)
        return;
      let count = 0;
      let targetCount = e.target.files.length;
      for(let f of e.target.files) {
        this.api.upload(f, true).then((ret: UploadResult)=>{ // ON SUCCUESS
          count++;
          if (count === targetCount) {
            this.snack.open('Success: All Files were uploaded!','',{duration:2000});
            this.refreshFiles();
          }
        },(ret:HttpErrorResponse)=>{ // ON ERROR
          switch (ret.error.err) {
            case -2:
              this.snack.open('ERROR UPLOADING ' + f.name,'DISMISS');
              break;
            case -3:
              this.snack.open('INVALID EXTENSION IN ' + f.name,'DISMISS');
              break;
            case -3:
              this.snack.open('PERMISSION DENIED','DISMISS');
              break;
          }
        });
      }
    });
  }
  
  showUploadWindow() {
    this.uploadInput.nativeElement.click();
  }
  
  downloadZip() {
    this.api.downloadZip(null);
  }
  
  downloadSelected() {
    let files : string[] = [];
    for (let f of this.selection.selected) {
      files.push(f.fileName);
    }
    this.api.downloadZip(files);
  }
  
  deleteSelected() {
    let ref = this.dialog.open(YesNoDialogComponent,{
      data: {
        title: 'Are you sure?',
        msg: 'The selected files will be deleted permanently.',
        yes: 'DELETE',
        no: 'CANCEL'
      }
    });
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        let promises : Promise<any>[] = [];
        for (let f of this.selection.selected) {
          promises.push(this.api.deleteFile(f.fileName));
        }
        Promise.all(promises).then(()=>{
          this.snack.open('SELECTED FILES WERE DELETED','',{duration:2000});
        },()=>{
          this.snack.open('ERROR: NOT ALL FILES WERE DELETED','',{duration:2000});
        }).then(()=>{
          this.refreshFiles();
        });
      }
    });
  }

}