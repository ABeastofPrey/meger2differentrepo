import { Injectable, NgZone, ApplicationRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebsocketService, MCQueryResponse } from './websocket.service';
import { DataService } from './data.service';
import { EventEmitter } from '@angular/core';

const POLL_INTERVAL: number = 100;

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
  private lastTick: number = 0;

  private _joints: Coordinate[] = [];
  private _locations: Coordinate[] = [];
  private _axis: Coordinate = null;
  private oldString: string = null;
  private interval: any = null;
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

  public coosLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public positonChange: EventEmitter<number[]> = new EventEmitter();

  private update(coordinates: string) {
    if (this.oldString === coordinates) {
      coordinates = null;
      return;
    }
    this.oldString = coordinates;
    var newLocations = [];
    var newJoints = [];
    var parts = coordinates.split(';');
    if (parts.length > 2) {
      if (
        this._locationKeysString !== parts[0].substring(1, parts[0].length - 1)
      )
        this._locationKeysString = parts[0].substring(1, parts[0].length - 1);
      if (this._jointKeysString !== parts[2].substring(1, parts[2].length - 1))
        this._jointKeysString = parts[2].substring(1, parts[2].length - 1);
      var locationKeys = this._locationKeysString.split(',');
      var locationValues = parts[1]
        .substring(1, parts[1].length - 1)
        .split(',');
      var jointKeys = this._jointKeysString.split(',');
      var jointValues = parts[3].substring(1, parts[3].length - 1).split(',');
      for (var i = 0; i < locationKeys.length; i++) {
        newLocations.push(
          new Coordinate(locationKeys[i], parseFloat(locationValues[i]))
        );
        newJoints.push(
          new Coordinate(jointKeys[i], parseFloat(jointValues[i]))
        );
      }
      this._joints = newJoints;
      this._locations = newLocations;
      this._axis = null;
      var now = new Date().getTime();
      if (now - this.lastTick > POLL_INTERVAL) {
        this.ref.tick();
        this.lastTick = now;
        now = null;
      }
    } else if (parts.length === 2) {
      this._joints = null;
      this._locations = null;
      var key = parts[0].substring(1, parts[0].length - 1);
      var val = parts[1].substring(1, parts[1].length - 1);
      this._axis = new Coordinate(key, parseFloat(val));
      var now = new Date().getTime();
      if (now - this.lastTick > POLL_INTERVAL) {
        this.ref.tick();
        this.lastTick = now;
        now = null;
      }
    }
    coordinates = null;
    this.positonChange.emit(this.jointsAsArr);
  }

  constructor(
    private ws: WebsocketService,
    private _zone: NgZone,
    private ref: ApplicationRef,
    private data: DataService
  ) {
    this.data.dataLoaded.subscribe(stat => {
      if (stat && this.interval === null) {
        //LOADED and INTERVAL ISN'T SET
        this._zone.runOutsideAngular(() => {
          this.interval = setInterval(() => {
            //const now = new Date().getTime();
            this.ws.query('cyc2').then((result: MCQueryResponse) => {
              // console.log(new Date().getTime() - now);
              if (result.err || result.result.length === 0) {
                clearInterval(this.interval);
                return;
              }
              setTimeout(() => {
                this.update(result.result);
                if (!this.coosLoaded.value)
                  this._zone.run(() => {
                    this.coosLoaded.next(true);
                  });
                result.result = null;
                result = null;
              }, 0);
            });
          }, POLL_INTERVAL);
        });
      }
    });

    this.ws.isConnected.subscribe(stat => {
      if (!stat) {
        clearInterval(this.interval);
        this.interval = null;
        this.coosLoaded.next(false);
      }
    });
  }

  trackByValue(index: number, c: Coordinate) {
    return c.value;
  }
}
