import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ErrorHistoryRoutingModule } from './error-history-routing.module';
import { ErrorHistoryComponent } from './error-history.component';

@NgModule({
  imports: [CommonModule, SharedModule, ErrorHistoryRoutingModule],
  declarations: [ErrorHistoryComponent],
  exports: [ErrorHistoryComponent],
})
export class ErrorHistoryModule {}
