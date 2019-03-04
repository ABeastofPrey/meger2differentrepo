import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { McFileTreeComponent } from './components/mc-file-tree/mc-file-tree.component';
import {SharedModule} from '../shared/shared.module';
import {FileFilterService} from './file-filter.service';
import { NewFileDialogComponent } from './components/new-file-dialog/new-file-dialog.component';

@NgModule({
  declarations: [McFileTreeComponent, NewFileDialogComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    McFileTreeComponent,
    NewFileDialogComponent
  ],
  providers: [FileFilterService],
  entryComponents: [NewFileDialogComponent]
})
export class FileTreeModule { }
