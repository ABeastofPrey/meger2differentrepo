import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { DataService } from './data.service';
import { EventEmitter } from '@angular/core';
import {ErrorFrame} from '../models/error-frame.model';

const POLL_INTERVAL = 100;

export class Coordinate {
  key: string;
  value: number;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
  }
}

@Injectable()
export class CoordinatesService {
  private lastTick = 0;

  private _joints: Coordinate[] = [];
  private _locations: Coordinate[] = [];
  private _axis: Coordinate = null;
  private oldString: string = null;
  private interval: number = null;
  private _locationKeysString: string;
  private _jointKeysString: string;

  private _obsJoints = new BehaviorSubject<Coordinate[]>(null);
  readonly obsJoints: Observable<Coordinate[]> = this._obsJoints.asObservable();
  private _obsLocations = new BehaviorSubject<Coordinate[]>(null);
  readonly obsLocations: Observable<
    Coordinate[]
  > = this._obsLocations.asObservable();
  private _obsAxis = new BehaviorSubject<Coordinate>(null);
  readonly obsAxis: Observable<Coordinate> = this._obsAxis.asObservable();

  get joints(): Coordinate[] {
    return this._joints;
  }
  get locations(): Coordinate[] {
    return this._locations;
  }
  get axisCoordinate(): Coordinate {
    return this._axis;
  }
  get locationKeys(): string {
    return this._locationKeysString;
  }
  get jointKeys(): string {
    return this._jointKeysString;
  }

  get jointsAsArr(): number[] {
    if (this.joints === null) return [];
    return this.joints.map(j => {
      return j.value;
    });
  }

  coosLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  positonChange: EventEmitter<number[]> = new EventEmitter();

  private update(coordinates: string) {
    if (this.oldString === coordinates) {
      coordinates = null;
      return;
    }
    this.oldString = coordinates;
    const newLocations = [];
    const newJoints = [];
    const parts = coordinates.split(';');
    if (parts.length > 2) {
      if (
        this._locationKeysString !== parts[0].substring(1, parts[0].length - 1)
      ) {
        this._locationKeysString = parts[0].substring(1, parts[0].length - 1);
      }
      if (this._jointKeysString !== parts[2].substring(1, parts[2].length - 1)) {
        this._jointKeysString = parts[2].substring(1, parts[2].length - 1);
      }
      const locationKeys = this._locationKeysString.split(',');
      const locationValues = parts[1]
        .substring(1, parts[1].length - 1)
        .split(',');
      const jointKeys = this._jointKeysString.split(',');
      const jointValues = parts[3].substring(1, parts[3].length - 1).split(',');
      for (let i = 0; i < locationKeys.length; i++) {
        newLocations.push(
          new Coordinate(locationKeys[i], Number(locationValues[i]))
        );
        newJoints.push(
          new Coordinate(jointKeys[i], Number(jointValues[i]))
        );
      }
      this._joints = newJoints;
      this._locations = newLocations;
      this._axis = null;
    } else if (parts.length === 2) {
      this._joints = null;
      this._locations = null;
      this._locationKeysString = null;
      this._jointKeysString = null;
      const key = parts[0].substring(1, parts[0].length - 1);
      const val = parts[1].substring(1, parts[1].length - 1);
      this._axis = new Coordinate(key, Number(val));
    }
    coordinates = null;
    let now = new Date().getTime();
    if (now - this.lastTick > POLL_INTERVAL) {
      this._zone.run(()=>{
        this.positonChange.emit(this.jointsAsArr);
      });
      this.lastTick = now;
      now = null;
    }
  }
  
  setDebugMode(on: boolean) {
    if (on) {
      this.ws.clearInterval(this.interval);
      this.interval = null;
      this.coosLoaded.next(false);
      this.data.setDebugMode(on);
    }
  }

  constructor(
    private ws: WebsocketService,
    private _zone: NgZone,
    private data: DataService
  ) {
    this.data.dataLoaded.subscribe(stat => {
      if (stat && this.interval === null) {
        //LOADED and INTERVAL ISN'T SET
        this._zone.runOutsideAngular(() => {
          this.interval = 
              this.ws.send('cyc2',false,(result: string, cmd: string, err: ErrorFrame[]) => {
            if (err || result.length === 0) {
              this.ws.clearInterval(this.interval);
              console.error('cyc2 returned wrong value:');
              console.error(result,cmd,err);
              this.interval = null;
              this.oldString = null;
              this._zone.run(() => {
                this.coosLoaded.next(false);
              });
              return;
            }
            this.update(result);
            if (!this.coosLoaded.value) {
              this._zone.run(() => {
                this.coosLoaded.next(true);
              });
            }
          }, POLL_INTERVAL);
        });
      }
    });

    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        this.ws.clearInterval(this.interval);
        this.interval = null;
        this.oldString = null;
        this.coosLoaded.next(false);
      }
    });
  }

  trackByValue(index: number, c: Coordinate) {
    return c.value;
  }
}
