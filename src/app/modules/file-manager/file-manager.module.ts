import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileManagerRoutingModule} from './file-manager-routing.module';
import {SharedModule} from '../shared/shared.module';
import {FileMngrComponent} from './file-mngr.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FileManagerRoutingModule
  ],
  declarations: [
    FileMngrComponent
  ],
  exports: [
    FileMngrComponent
  ]
})
export class FileManagerModule { }
