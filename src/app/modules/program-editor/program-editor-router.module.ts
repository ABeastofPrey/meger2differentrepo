import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgramEditorComponent } from './components/program-editor/program-editor.component';

const routes: Routes = [
  {
    path: '',
    component: ProgramEditorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramEditorRouterModule {}
