import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { SharedModule } from '../shared/shared.module';
import { HomeScreenRoutingModule } from './home-screen-routing.module';
import { AddFeatureDialogComponent } from './components/add-feature-dialog/add-feature-dialog.component';

@NgModule({
  imports: [CommonModule, SharedModule, HomeScreenRoutingModule],
  declarations: [
    HomeScreenComponent,
    TerminalComponent,
    AddFeatureDialogComponent,
  ],
  entryComponents: [AddFeatureDialogComponent],
  exports: [HomeScreenComponent, TerminalComponent]
})
export class HomeScreenModule {}
