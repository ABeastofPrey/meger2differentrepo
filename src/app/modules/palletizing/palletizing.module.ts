import { CanDeactivateGuard } from './can-deactivate.guard';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PalletWizardComponent } from './components/pallet-wizard/pallet-wizard.component';
import { CustomItemMenuComponent } from './components/custom-item-menu/custom-item-menu.component';
import { AddPalletDialogComponent } from './components/add-pallet-dialog/add-pallet-dialog.component';
import { DraggableItemDirective } from './directives/draggable-item.directive';
import { SharedModule } from '../shared/shared.module';
import { PalletizingComponent } from './components/palletizing-screen/palletizing.component';
import { PalletLevelDesignerComponent } from './components/pallet-level-designer/pallet-level-designer.component';
import { PalletizingRoutingModule } from './palletizing-routing.module';

@NgModule({
  imports: [SharedModule, CommonModule, PalletizingRoutingModule],
  exports: [PalletizingComponent],
  declarations: [
    PalletizingComponent,
    PalletWizardComponent,
    CustomItemMenuComponent,
    AddPalletDialogComponent,
    DraggableItemDirective,
    PalletLevelDesignerComponent,
  ],
  entryComponents: [
    PalletWizardComponent,
    CustomItemMenuComponent,
    AddPalletDialogComponent,
  ],
  providers: [CanDeactivateGuard],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PalletizingModule {}
