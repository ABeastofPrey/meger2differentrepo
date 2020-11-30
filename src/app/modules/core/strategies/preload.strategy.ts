import { PreloadingStrategy } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Route } from '@angular/router';
import { Injectable } from "@angular/core";

@Injectable()
export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<void> {
    return route.data && route.data.preload ? load() : of(null);
  }
}
