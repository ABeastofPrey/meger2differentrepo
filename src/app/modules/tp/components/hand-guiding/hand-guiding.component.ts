import { Component, OnInit } from '@angular/core';
import { TpStatService } from '../../../../modules/core/services/tp-stat.service';
import { HandGuidingService } from './hand-guiding.service';
import { map, prop, compose, then } from 'ramda';
import { Either } from 'ramda-fantasy';

const { either } = Either;

// tslint:disable-next-line: interface-name
interface IJoint {
  checked: boolean;
  value: string;
}

@Component({
  selector: 'app-hand-guiding',
  providers: [HandGuidingService],
  templateUrl: './hand-guiding.component.html',
  styleUrls: ['./hand-guiding.component.scss'],
})
export class HandGuidingComponent implements OnInit {
  joints: IJoint[] = [
    { checked: false, value: 'j1' },
    { checked: false, value: 'j2' },
    { checked: false, value: 'j3' },
    { checked: false, value: 'j4' },
  ];

  // private debouncer: Subject<any> = new Subject();

  constructor(
    private stat: TpStatService,
    private service: HandGuidingService
  ) {
    // this.debouncer.pipe(debounceTime(1000)).subscribe(() => {
    //     const hasFree = this.joints.some(joint => joint.checked === true);
    //     if (hasFree) {
    //         this.lockAll();
    //     }
    // });
  }

  canNotUse(): boolean {
    const isNotT1OrT2Mode = this.stat.mode !== 'T1' && this.stat.mode !== 'T2';
    const _canNotUse = this.stat.enabled || isNotT1OrT2Mode ? true : false;
    const hasFree = this.joints.some(joint => joint.checked === true);
    if (_canNotUse && hasFree) {
      // this.debouncer.next();
      this.lockAll();
    }
    return _canNotUse;
  }

  ngOnInit(): void {
    this.initJoints();
  }

  freeAll(): void {
    this.joints.forEach(joint => (joint.checked = true));
    this.setJoints();
  }

  lockAll(): void {
    this.joints.forEach(joint => (joint.checked = false));
    this.setJoints();
  }

  setJoints(): void {
    this.service.setJoints(this.getStates(this.joints));
  }

  private initJoints(): void {
    const converter = (x: number) => !!x;
    const retrieveJoints = this.service.getJoints.bind(this.service);
    const logErr = (err: string | Error ) => console.warn(err);
    const setSta = (res: number[]) => {
      const states: boolean[] = map(converter, res);
      this.joints.forEach((joint, index) => {
        joint.checked = states[index];
      });
    };
    const logOrSet = either(logErr, setSta);
    const _initJoints = compose(
      then(logOrSet),
      retrieveJoints
    );
    _initJoints();
  }

  private getStates(joints: IJoint[]): number[] {

    const converter = (x: boolean) => ~~x;
    const checkProp = prop('checked');
    const getState = compose(
      converter,
      checkProp
    );
    const _getStates = map(getState);
    return _getStates(joints) as number[];
  }
}
