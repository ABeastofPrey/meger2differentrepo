import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { NewPositionTriggerComponent } from '../new-position-trigger/new-position-trigger.component';
import { PositionTriggerService, IResPLS } from '../../../services/position-trigger.service';
import {
  T, F, ifElse, always, map, compose, converge, propEq, equals, filter,
  bind, forEach, all, any, not, and, lensProp, set, or, isNil, isEmpty, gte,
  __, prop, reduce, complement,
} from 'ramda';
import { Either } from 'ramda-fantasy';
import { TranslateService } from '@ngx-translate/core';

// tslint:disable-next-line: interface-name
export interface IPositionTrigger {
  name: string;
  checked: boolean;
  distance: number;
  output: number[];
  state: number[];
  from: number[];
  selectedOutput: number;
  selectedState: number;
  selectedFrom: number;
  selectedSourceType: string;
}

type JudgeCheckFn = (elements: IPositionTrigger[]) => boolean;
type CheckElesFn = (elements: IPositionTrigger[]) => IPositionTrigger[];
type ToggleAllFn = (element: {
  checked: boolean;
}) => (elements: IPositionTrigger[]) => IPositionTrigger[];

export const freeze = x => Object.freeze(x);

export const initColumns: () => ReadonlyArray<string> = always(
  freeze(['check', 'Name', 'Output', 'State', 'From', 'Distance'])
);

export const assemblePLS: (x: IResPLS) => IPositionTrigger = x => {
  const obj: IPositionTrigger = {
    checked: false,
    name: x.PLSname,
    output: x.Output,
    distance: x.Position,
    state: [0, 1],
    from: [0, 1], // for from: 0 means start point, 1 means end point.
    selectedOutput: x.DigitalOut,
    selectedState: x.Polarity,
    selectedFrom: x.RelatedTo,
    selectedSourceType: x.Source
  };
  return obj;
};

export const assemblePLSList: (x: IResPLS[]) => IPositionTrigger[] = map(assemblePLS);

export const isChecked = propEq('checked', T());

export const isAllChecked: JudgeCheckFn = all(isChecked);

export const notAllChecked: JudgeCheckFn = complement(isAllChecked);

export const hasChecked: JudgeCheckFn = any(isChecked);

export const partialChecked: JudgeCheckFn = converge(and, [hasChecked, notAllChecked]);

export const checkedLensProp = lensProp('checked');

export const checkElement: (x: IPositionTrigger) => IPositionTrigger = set(checkedLensProp, T());

export const uncheckElement: (x: IPositionTrigger) => IPositionTrigger = set(checkedLensProp, F());

export const checkAll: CheckElesFn = map(checkElement);

export const uncheckAll: CheckElesFn = map(uncheckElement);

export const toggleAll: ToggleAllFn = ifElse(isChecked, always(checkAll), always(uncheckAll));

export const canCreate: (x: string) => boolean = complement(converge(or, [isNil, isEmpty]));

// tslint:disable-next-line: no-any
export const isNumber: (x: any) => boolean = converge(and, [
  compose(not, isNaN, Number),
  complement(isEmpty),
]);

export const isPositiveNumber: (x: number) => boolean = converge(and, [
  isNumber,
  gte(__, 0),
]);

export const isNotPositiveNumber: (x: number) => boolean = complement(
  isPositiveNumber
);

export const isChanged: (pre: number, cur: number) => boolean = complement(
  equals
);

export const getSelectedNames: (x: IPositionTrigger[]) => string[] = compose(
  map(prop('name')),
  filter(isChecked)
);

export const insertComma: (x: string[]) => string = reduce(
  (acc, i) => acc + i + ',',
  ''
);

export const combineNames: (x: IPositionTrigger[]) => string = compose(
  insertComma,
  getSelectedNames
);

@Component({
  selector: 'app-position-trigger',
  templateUrl: './position-trigger.component.html',
  styleUrls: ['./position-trigger.component.scss'],
})
export class PositionTriggerComponent implements OnInit {
  private preDistance: number;
  private positiveNumTip: string;
  // private notifier: Subject<boolean> = new Subject();

  data: IPositionTrigger[] = []; // table data source.
  get columns(): ReadonlyArray<string> {
    return initColumns();
  }
  get isAllChecked(): boolean {
    return isAllChecked(this.data);
  }
  get hasChecked(): boolean {
    return hasChecked(this.data);
  }
  get partialChecked(): boolean {
    return partialChecked(this.data);
  }

  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private service: PositionTriggerService,
    private trn: TranslateService
  ) { }

  ngOnInit(): void {
    this.trn
      .get(['projectSettings.position_trigger.positiveNumTip'])
      .subscribe(words => {
        this.positiveNumTip =
          words['projectSettings.position_trigger.positiveNumTip'];
      });
    this.assembleData();
  }

  public toggleAll(event: any): void {
    this.data = toggleAll(event)(this.data);
  }

  createPls(): void {
    this.dialog
      .open(NewPositionTriggerComponent, { disableClose: true })
      .afterClosed()
      .subscribe(async (name: string) =>
        canCreate(name) &&
        Either.either(
          err => console.log(err), // handle error.
          (res: IResPLS[]) => {
            this.data = assemblePLSList(res);
          }
        )(await this.service.createPls(name))
      );
  }

  resetValue(element: IPositionTrigger): void {
    element.distance = 0;
  }

  async updatePls(element: IPositionTrigger): Promise<void> {
    Either.either(
      err => console.log(err), // handle error.
      (res: IResPLS[]) => {
        this.data = assemblePLSList(res);
      }
    )(await this.service.updatePls(element));
  }

  async deletePls(): Promise<void> {
    const bindDelete = bind(this.service.deletePls, this.service);
    const deleteAll = await Promise.all(
      map(bindDelete, getSelectedNames(this.data))
    );
    forEach(
      Either.either(
        err => console.log(err), // handle error.
        (res: IResPLS[]) => {
          this.data = assemblePLSList(res);
        }
      ), deleteAll);
  }

  onFocus(distance: number) {
    this.preDistance = distance;
  }

  onBlur(element: IPositionTrigger): void {
    if (isNotPositiveNumber(element.distance)) {
      element.distance = Number(this.preDistance);
      this.snackBar.open(this.positiveNumTip, '', { duration: 2000 });
    } else if (isChanged(this.preDistance, element.distance)) {
      if (element.selectedSourceType === 'Percentage' && element.distance > 100) {
        element.distance = Number(this.preDistance);
        this.snackBar.open(this.positiveNumTip, '', { duration: 2000 });
        return;
      }
      this.updatePls(element);
    }
  }

  private async assembleData(): Promise<void> {
    Either.either(
      err => console.log(err), // handle error.
      (res: IResPLS[]) => {
        this.data = assemblePLSList(res);
      } // bind data.
    )(await this.service.retrievePls());
  }
}
