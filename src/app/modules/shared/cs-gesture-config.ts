import { GestureConfig, HammerManager, HammerInstance } from '@angular/material/core';
import { Injectable } from '@angular/core';
import * as hammer from 'hammerjs';

@Injectable()
export class ControlStudioGestureConfig extends GestureConfig {
  buildHammer(element: HTMLElement): HammerInstance {
    const mc = super.buildHammer(element) as HammerManager;
    mc.set({ touchAction: 'pan-y' });

    // Your other configurations
    const swipe = new hammer.Swipe({ velocity: 0.3, threshold: 10 });
    mc.add(swipe);

    const pinch = new hammer.Pinch();
    mc.add(pinch);

    return mc;
  }
}
