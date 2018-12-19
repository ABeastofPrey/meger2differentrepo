import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppsComponent} from './components/apps/apps.component';
import {SharedModule} from '../shared/shared.module';
import {ToolsRoutingModule} from './tools-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ToolsRoutingModule
  ],
  declarations: [AppsComponent],
  exports: [AppsComponent]
})
export class ToolsModule { }
