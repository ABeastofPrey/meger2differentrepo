import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerComponent } from './logger.component';
import { SharedModule } from '../shared/shared.module';
import { LogRoutingModule } from './log-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, LogRoutingModule],
  declarations: [LoggerComponent],
  exports: [LoggerComponent],
})
export class LogScreenModule {}
