import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BlocklyEditorComponent} from './components/blockly-editor/blockly-editor.component';

const routes: Routes = [
  {
    path: '',
    component: BlocklyEditorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlocklyRoutingModule {}
