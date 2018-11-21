import {PreloadingStrategy} from "@angular/router";
import {Observable, of} from "rxjs";
import {Route} from "@angular/router";
import {TpStatService} from "../services/tp-stat.service";
import {OnInit} from "@angular/core";

export class PreloadSelectedModulesList implements PreloadingStrategy {
  
  preload(route: Route, load: Function): Observable<any> {
    return route.data && route.data.preload ? load() : of(null);
  }
}