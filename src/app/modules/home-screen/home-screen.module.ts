import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeScreenComponent} from './components/home-screen/home-screen.component';
import {TerminalComponent} from './components/terminal/terminal.component';
import {TerminalService} from './services/terminal.service';
import {SharedModule} from '../shared/shared.module';
import {HomeScreenRoutingModule} from './home-screen-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeScreenRoutingModule
  ],
  declarations: [
    HomeScreenComponent,
    TerminalComponent,
  ],
  providers: [TerminalService],
  exports: [
    HomeScreenComponent,
    TerminalComponent
  ]
})
export class HomeScreenModule { }
