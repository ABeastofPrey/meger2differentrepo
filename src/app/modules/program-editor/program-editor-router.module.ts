import { VisionComponent } from './components/vision/vision.component';
import { FwconfigEditorComponent } from './components/fwconfig-editor/fwconfig-editor.component';
import { IoMappingScreenComponent } from './modules/io-mapping/components/io-mapping-screen/io-mapping-screen.component';
import { PayloadWizardComponent } from './../payloads/components/payload-wizard/payload-wizard.component';
import { GripperScreenComponent } from './../gripper-screen/components/gripper-screen/gripper-screen.component';
import { FramesComponent } from './components/frames/frames.component';
import { ProgramSettingsComponent } from './components/program-settings/program-settings.component';
import { DataScreenComponent } from './components/data-screen/data-screen.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgramEditorComponent } from './components/program-editor/program-editor.component';
import { ProgramEditorMainComponent } from './components/program-editor-main/program-editor-main.component';
import { CanDeactivateDataGuard } from './can-deactivate-data';
import { PluginComponent } from './components/plugins/plugin.component';

const routes: Routes = [
  {
    path: '',
    component: ProgramEditorComponent,
    children: [
      {
        path: '',
        component: ProgramEditorMainComponent
      },
      {
        path: 'data',
        component: DataScreenComponent,
        canDeactivate: [CanDeactivateDataGuard]
      },
      {
        path: 'pPoints',
        component: DataScreenComponent,
        data: {
          useAsProjectPoints: true
        },
        canDeactivate: [CanDeactivateDataGuard]
      },
      {
        path: 'settings',
        component: ProgramSettingsComponent
      },
      {
        path: 'frames',
        component: FramesComponent
      },
      {
        path: 'grippers',
        component: GripperScreenComponent
      },
      {
        path: 'payloads',
        component: PayloadWizardComponent
      },
      {
        path: 'io',
        component: IoMappingScreenComponent
      },
      {
        path: 'fwconfig',
        component: FwconfigEditorComponent
      },
      {
        path: 'vision',
        component: VisionComponent
      },
      {
        path: 'plugin',
        component: PluginComponent
      },
      {
        path: 'pallets',
        loadChildren: () => 
          import('../palletizing/palletizing.module').then(m => m.PalletizingModule),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramEditorRouterModule {}
