import {
  PositionTriggerComponent,
  IPositionTrigger,
  initColumns,
  assemblePLS,
  assemblePLSList,
  isChecked,
  isAllChecked,
  notAllChecked,
  hasChecked,
  partialChecked,
  checkedLensProp,
  checkElement,
  uncheckElement,
  checkAll,
  uncheckAll,
  toggleAll,
  canCreate,
  isNumber,
  isPositiveNumber,
  isChanged,
  getSelectedNames,
  insertComma,
  combineNames,
} from './position-trigger.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  PositionTriggerService,
  IResPLS,
} from '../../../services/position-trigger.service';

import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import {
  range,
  map,
  has,
  view,
  set,
  compose,
  not,
  all,
  always,
  equals,
  match,
} from 'ramda';
import { Either } from 'ramda-fantasy';
import { TerminalService } from '../../../../home-screen/services/terminal.service';
import {of} from 'rxjs';

const { Left, Right } = Either;

describe('PositionTriggerComponent', () => {
  let fixture: ComponentFixture<PositionTriggerComponent>;
  let comp: PositionTriggerComponent;

  const count = 5;
  const name = 'SSS';
  const resPls: IResPLS = {
    index: 1,
    PLSname: name,
    DigitalOut: 1,
    Position: 1,
    Polarity: 0,
    RelatedTo: 0,
    Output: [1, 2, 3],
    Source: 'Percentage',
  };
  const resPlsList: IResPLS[] = map(always(resPls), range(0, count));
  const element: IPositionTrigger = assemblePLS(resPls);
  const elements = assemblePLSList(resPlsList);
  const checkedElements = checkAll(elements);
  const nameList = getSelectedNames(checkedElements);
  const nameStringWithComma1 = insertComma(nameList);
  const nameStringWithComma2 = combineNames(checkedElements);
  const checkedObj = { checked: true };
  const uncheckedObj = { checked: false };
  const checkedObjList = map(() => checkedObj, range(0, 5));
  const uncheckedObjList = map(() => uncheckedObj, range(0, 5));
  const partialCheckedObjList = map(
    n => (n % 2 === 0 ? checkedObj : uncheckedObj),
    range(0, 5)
  );
  const hasNoChecked = all(
    compose(
      not,
      isChecked
    )
  );

  const fakeService = jasmine.createSpyObj('MotionTriggerService', [
    'retrievePls',
    'updatePls',
    'deletePls',
    'createPls',
  ]);
  let retrievePlsSyp = fakeService.retrievePls.and.returnValue(
    Right(resPlsList)
  );
  const updatePlsSpy = fakeService.updatePls.and.returnValue(
    Left('update failed.')
  );
  const deletePlsSpy = fakeService.deletePls.and.returnValue(
    Left('delete failed.')
  );
  const createPlsSpy = fakeService.createPls;
  fakeService.broadcaster = new EventEmitter();
  const fakeMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  const openSpy = fakeMatSnackBar.open;
  const fakeMatDialog = jasmine.createSpyObj('MatDialog', ['']);
  fakeMatDialog.open = (com, op) =>
    Object({ afterClosed: () => new EventEmitter<string>() });
  const terminalService = jasmine.createSpyObj('TerminalService', ['']);
  terminalService.sentCommandEmitter = new EventEmitter();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionTriggerComponent],
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [
        { provide: PositionTriggerService, useValue: fakeService },
        { provide: MatSnackBar, useValue: fakeMatSnackBar },
        { provide: MatDialog, useValue: fakeMatDialog },
        { provide: TerminalService, useValue: terminalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(PositionTriggerComponent);
      comp = fixture.componentInstance;
    });
  }));

  it('should init 6 columns.', () => {
    const tableColumns = initColumns();
    expect(tableColumns.length).toEqual(6);
    expect(comp.columns.length).toEqual(6);
  });

  it('should assemble the givin number elements.', () => {
    expect(elements.length).toEqual(count);
  });

  it('should has all neccessary properties.', () => {
    const hasCheckedProp = has('checked');
    const hasName = has('name');
    const hasOuput = has('output');
    const hasDistance = has('distance');
    const hasState = has('state');
    const hasFrom = has('from');
    const hasSelectedOutput = has('selectedOutput');
    const hasSelectedState = has('selectedState');
    const hasSelectedFrom = has('selectedFrom');
    expect(hasCheckedProp(element)).toBeTruthy();
    expect(hasName(element)).toBeTruthy();
    expect(hasOuput(element)).toBeTruthy();
    expect(hasDistance(element)).toBeTruthy();
    expect(hasState(element)).toBeTruthy();
    expect(hasFrom(element)).toBeTruthy();
    expect(hasSelectedOutput(element)).toBeTruthy();
    expect(hasSelectedState(element)).toBeTruthy();
    expect(hasSelectedFrom(element)).toBeTruthy();
  });

  it('should give a exactly results of isChecked function.', () => {
    expect(isChecked(checkedObj)).toBeTruthy();
    expect(isChecked(uncheckedObj)).toBeFalsy();
  });

  it('should give a exactly results of isAllChecked function.', () => {
    expect(isAllChecked(checkedObjList)).toBeTruthy();
    expect(isAllChecked(uncheckedObjList)).toBeFalsy();
    expect(isAllChecked(partialCheckedObjList)).toBeFalsy();
  });

  it('should give a exactly results of notAllChecked function.', () => {
    expect(notAllChecked(checkedObjList)).toBeFalsy();
    expect(notAllChecked(uncheckedObjList)).toBeTruthy();
    expect(notAllChecked(partialCheckedObjList)).toBeTruthy();
  });

  it('should give a exactly results of haveChecked function.', () => {
    expect(hasChecked(checkedObjList)).toBeTruthy();
    expect(hasChecked(uncheckedObjList)).toBeFalsy();
    expect(hasChecked(partialCheckedObjList)).toBeTruthy();
  });

  it('should give a exactly results of partialChecked function.', () => {
    expect(partialChecked(checkedObjList)).toBeFalsy();
    expect(partialChecked(uncheckedObjList)).toBeFalsy();
    expect(partialChecked(partialCheckedObjList)).toBeTruthy();
  });

  it('should give the correct view of checked property.', () => {
    expect(view(checkedLensProp, checkedObj)).toBe(true);
    expect(view(checkedLensProp, uncheckedObj)).toBe(false);
  });

  it('should check the give element.', () => {
    const uncheckedElement = set(checkedLensProp, false, element);
    const checkedElement = checkElement(uncheckedElement);
    expect(view(checkedLensProp, checkedElement)).toBe(true);
  });

  it('should uncheck the give element.', () => {
    const uncheckedElement = set(checkedLensProp, true, element);
    const checkedElement = uncheckElement(uncheckedElement);
    expect(view(checkedLensProp, checkedElement)).toBe(false);
  });

  it('should checkAll the give elements.', () => {
    const allCheckedList1 = checkAll(uncheckedObjList);
    const allCheckedList2 = checkAll(partialCheckedObjList);
    expect(isAllChecked(allCheckedList1)).toBeTruthy();
    expect(isAllChecked(allCheckedList2)).toBeTruthy();
  });

  it('should uncheckAll the give elements.', () => {
    const allUncheckedList1 = uncheckAll(checkedObjList);
    const allUncheckedList2 = uncheckAll(partialCheckedObjList);
    expect(hasNoChecked(allUncheckedList1)).toBeTruthy();
    expect(hasNoChecked(allUncheckedList2)).toBeTruthy();
  });

  it('should toggle all elements.', () => {
    const toggleList1 = toggleAll(checkedObj)(uncheckedObjList);
    const toggleList2 = toggleAll(uncheckedObj)(checkedObjList);
    expect(isAllChecked(toggleList1)).toBeTruthy();
    expect(hasNoChecked(toggleList2)).toBeTruthy();
  });

  it('should give the exact result of canCreate.', () => {
    expect(canCreate(null)).toBeFalsy();
    expect(canCreate(undefined)).toBeFalsy();
    expect(canCreate('')).toBeFalsy();
    expect(canCreate('aaa')).toBeTruthy();
  });

  it('should give the exact result of isNumber.', () => {
    expect(isNumber('a')).toBeFalsy();
    expect(isNumber('1')).toBeTruthy();
    expect(isNumber(0)).toBeTruthy();
  });

  it('should give the exact result of isPositiveNumber.', () => {
    expect(isPositiveNumber(-1)).toBeFalsy();
    expect(isPositiveNumber(0)).toBeTruthy();
    expect(isPositiveNumber(1)).toBeTruthy();
  });

  it('should give the exact result of isChanged.', () => {
    expect(isChanged(1, 1)).toBeFalsy();
    expect(isChanged(0, 1)).toBeTruthy();
  });

  it('should get all selected name.', () => {
    expect(isAllChecked(checkedElements)).toBeTruthy();
    expect(nameList.length).toEqual(count);
    expect(all(equals(name), nameList)).toBeTruthy();
  });

  it('should has comma after insert comma.', () => {
    const matchComma1 = match(/,/, nameStringWithComma1);
    const matchComma2 = match(/,/, nameStringWithComma2);
    expect(matchComma1.length).toBeGreaterThan(0);
    expect(matchComma2.length).toBeGreaterThan(0);
  });

  it('should assemble data after on-init.', async(() => {
    fixture.detectChanges();
    expect(retrievePlsSyp.calls.any()).toBe(true, 'retrievePls be called.');
    fixture.whenStable().then(() => {
      expect(comp.data.length).toEqual(count);
    });
  }));

  it('should assemble data failed after on-init.', async(() => {
    retrievePlsSyp = fakeService.retrievePls.and.returnValue(
      Left('retrieve failed.')
    );
    fixture.detectChanges();
    expect(retrievePlsSyp.calls.any()).toBe(true, 'retrievePls be called.');
    retrievePlsSyp.calls.reset();
    retrievePlsSyp = fakeService.retrievePls.and.returnValue(Right(resPlsList));
  }));

  it('should toggle all elements via component.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      comp.toggleAll(checkedObj);
      expect(isAllChecked(comp.data)).toBeTruthy();
      comp.toggleAll(uncheckedObj);
      expect(hasNoChecked(comp.data)).toBeTruthy();
    });
  }));

  it('should call updatePls.', () => {
    comp.updatePls(element);
    expect(updatePlsSpy.calls.any()).toBe(true, 'updatePls be called.');
  });

  it('should call deletePls.', async(() => {
    comp.deletePls();
    fixture.whenStable().then(() => {
      comp.toggleAll(checkedObj);
      expect(isAllChecked(comp.data)).toBeTruthy();
      // expect(deletePlsSpy.calls.any()).toBe(true, 'deletePlsSpy be called.');
    });
  }));

  it('should get expect result via hasChecked attr.', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      comp.toggleAll(checkedObj);
      expect(comp.hasChecked).toBeTruthy();
      comp.toggleAll(uncheckedObj);
      expect(comp.hasChecked).toBeFalsy();
    });
  }));

  it('should give the correct result for focus and blur events.', () => {
    updatePlsSpy.calls.reset();
    const preDistance = 4;
    const fakeMotion = { distance: 4 } as IPositionTrigger;
    comp.onFocus(preDistance);
    comp.onBlur(fakeMotion);
    expect(openSpy.calls.any()).toBe(false, 'should not open snakbar.');
    expect(updatePlsSpy.calls.any()).toBe(false, 'should not update pls');
    fakeMotion.distance = -5;
    comp.onBlur(fakeMotion);
    expect(openSpy.calls.any()).toBe(true, 'open snakbar.');
    expect(updatePlsSpy.calls.any()).toBe(false, 'should not update pls');
    fakeMotion.distance = 5;
    comp.onBlur(fakeMotion);
    expect(updatePlsSpy.calls.any()).toBe(true, 'update pls');
  });

  it('should create pls when gived corrected name.', () => {
    comp.createPls();
    expect(createPlsSpy.calls.any()).toBe(false, 'should not create pls');
    fakeMatDialog
      .open()
      .afterClosed()
      .emit('mypls');
    // expect(createPlsSpy.calls.any()).toBe(true, 'should create pls');
  });
});
