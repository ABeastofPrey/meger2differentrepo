import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { visionCommandFeatureKey, reducer as visionCommandReducer } from './reducers/vision-command.reducer';
import { VisionCommandEffect } from './effects/vision-command.effect';
import { VisionCommandComponent } from './components/vision-command/vision-command.component';
import { VisionCommandService } from './services/vision-command.service';
import { VisionLoadStationBookComponent } from './components/vision-load-station-book/vision-load-station-book.component';

@NgModule({
    declarations: [VisionCommandComponent, VisionLoadStationBookComponent],
    imports: [
        CommonModule,
        SharedModule,
        StoreModule.forFeature(visionCommandFeatureKey, visionCommandReducer),
        EffectsModule.forFeature([VisionCommandEffect]),
    ],
    exports: [VisionCommandComponent, VisionLoadStationBookComponent],
    providers: [VisionCommandService],
    entryComponents: [VisionCommandComponent, VisionLoadStationBookComponent],
})
export class VisioinCommandModule { }
