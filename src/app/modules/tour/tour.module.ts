import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourWelcomeComponent } from './tour-welcome/tour-welcome.component';

@NgModule({
  declarations: [TourWelcomeComponent],
  imports: [CommonModule, SharedModule],
  exports: [TourWelcomeComponent],
  entryComponents: [TourWelcomeComponent]
})
export class TourModule { }
