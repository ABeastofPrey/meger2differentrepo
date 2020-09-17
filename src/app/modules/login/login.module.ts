import { NgModule } from '@angular/core';
import { LoginScreenComponent } from './login-screen.component';
import { SharedModule } from '../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { MaintenanceArmModule } from '../maintenance-arm/maintenance-arm.module';

@NgModule({
  imports: [SharedModule, LoginRoutingModule, MaintenanceArmModule],
  declarations: [LoginScreenComponent],
})
export class LoginModule { }
