import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IoMappingScreenComponent } from './components/io-mapping-screen/io-mapping-screen.component';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [IoMappingScreenComponent],
  exports: [IoMappingScreenComponent]
})
export class IoMappingModule { }
