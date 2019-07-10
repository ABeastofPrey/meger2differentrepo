import { NgModule } from '@angular/core';
import { LoginScreenComponent } from './login-screen.component';
import { SharedModule } from '../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  imports: [SharedModule, LoginRoutingModule],
  declarations: [LoginScreenComponent],
})
export class LoginModule {}
