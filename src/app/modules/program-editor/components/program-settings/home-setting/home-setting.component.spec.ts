import { MatSnackBar } from '@angular/material';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { HomeSettingComponent } from './home-setting.component';
import { HomeSettingService } from '../../../services/home-setting.service';
import { TerminalService } from '../../../../home-screen/services/terminal.service';
import { Either } from 'ramda-fantasy';
import { range, map, equals } from 'ramda';
import * as Faker from 'faker';

const { Left, Right } = Either;

describe('HomeSettingComponent', () => {
  let fixture: ComponentFixture<HomeSettingComponent>;
  let comp: HomeSettingComponent;

  const fakePositionList = map(Faker.random.number, range(0, 4));
  const fakeOrderList = map(Faker.random.number, range(0, 4));
  const terminalService = jasmine.createSpyObj('TerminalService', ['']);
  terminalService.sentCommandEmitter = new EventEmitter();
  const homeSettingService = jasmine.createSpyObj('', [
    'getHomePostion',
    'getHomeOrder',
    'updateHomePostion',
    'clearHomePosition',
    'updateHomeOrder',
    'readCurrentPosition',
    'getPositionMax',
    'getPositionMin',
  ]);
  homeSettingService.getHomePostion.and.returnValue(Right(fakePositionList));
  homeSettingService.getHomeOrder.and.returnValue(Right(fakeOrderList));
  homeSettingService.updateHomePostion.and.returnValue(Right('successfully'));
  homeSettingService.clearHomePosition.and.returnValue(Right());
  homeSettingService.updateHomeOrder.and.returnValue(Right(fakeOrderList));
  homeSettingService.readCurrentPosition.and.returnValue(
    Right(fakePositionList)
  );
  homeSettingService.getPositionMax.and.returnValue(Right(10));
  homeSettingService.getPositionMin.and.returnValue(Right(0));
  const fakeMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  const openSpy = fakeMatSnackBar.open;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeSettingComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule],
      providers: [
        { provide: HomeSettingService, useValue: homeSettingService },
        { provide: TerminalService, useValue: terminalService },
        { provide: MatSnackBar, useValue: fakeMatSnackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(HomeSettingComponent);
      comp = fixture.componentInstance;
    });
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });

  it('should retieve position list', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const allEq = equals(comp.positionList, fakePositionList);
      expect(allEq).toBeTruthy();
    });
  }));

  it('should retieve order list', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const allEq = equals(comp.orderList, fakeOrderList);
      expect(allEq).toBeTruthy();
    });
  }));

  it('should retieve position list failed', async(() => {
    homeSettingService.getHomePostion.and.returnValue(Left('Failed.'));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const a = comp.positionList;
      expect(homeSettingService.getHomePostion.calls.any()).toBe(true);
      homeSettingService.getHomePostion.calls.reset();
      homeSettingService.getHomePostion.and.returnValue(
        Right(fakePositionList)
      );
    });
  }));

  it('should retieve order list failed', async(() => {
    homeSettingService.getHomeOrder.and.returnValue(Left('Failed.'));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const a = comp.positionList;
      expect(homeSettingService.getHomeOrder.calls.any()).toBe(true);
      homeSettingService.getHomeOrder.calls.reset();
      homeSettingService.getHomeOrder.and.returnValue(Right(fakeOrderList));
    });
  }));

  it('should blur when press enter', () => {
    const event = {
      target: { blur: function() {} },
      keyCode: 13,
    };
    spyOn(event.target, 'blur');
    comp.onKeyup(event);
    expect(event.target.blur).toHaveBeenCalled();
  });

  it('should update order', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      comp.updateOrder(1, 20);
      expect(homeSettingService.updateHomeOrder.calls.any()).toBe(true);
    });
  }));

  it('should update order failed', async(() => {
    homeSettingService.updateHomeOrder.and.returnValue(Left('falied'));
    comp.updateOrder(1, 20);
    fixture.whenStable().then(() => {
      expect(homeSettingService.updateHomeOrder.calls.any()).toBe(true);
      homeSettingService.updateHomeOrder.calls.reset();
      homeSettingService.updateHomeOrder.and.returnValue(Right('successfully'));
    });
  }));

  it('should call readCurrentPosition', async(() => {
    comp.readCurrentPosition();
    fixture.whenStable().then(() => {
      expect(homeSettingService.readCurrentPosition.calls.any()).toBe(true);
    });
  }));

  it('should call readCurrentPosition failed', async(() => {
    homeSettingService.readCurrentPosition.and.returnValue(Left('falied'));
    comp.readCurrentPosition();
    fixture.whenStable().then(() => {
      expect(homeSettingService.readCurrentPosition.calls.any()).toBe(true);
      homeSettingService.readCurrentPosition.calls.reset();
      homeSettingService.readCurrentPosition.and.returnValue(
        Right('successfully')
      );
    });
  }));

  it('should update position successfully when enter empty', async(() => {
    const target = { value: '' };
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      comp.updatePosition(1, target as HTMLInputElement);
      expect(homeSettingService.clearHomePosition).toHaveBeenCalledWith(1);
    });
  }));

  it('should update position failed when enter empty', async(() => {
    const target = { value: '' };
    homeSettingService.clearHomePosition.and.returnValue(Left());
    fixture.whenStable().then(() => {
      comp.updatePosition(1, target as HTMLInputElement);
      expect(homeSettingService.clearHomePosition).toHaveBeenCalledWith(1);
      homeSettingService.clearHomePosition.calls.reset();
      homeSettingService.clearHomePosition.and.returnValue(Right());
    });
  }));

  it('should update position failed when enter empty and preview value is empty too', async(() => {
    const target = { value: '' };
    homeSettingService.clearHomePosition.calls.reset();
    homeSettingService.clearHomePosition.and.returnValue(Right());
    comp.onFocus('');
    fixture.whenStable().then(() => {
      comp.updatePosition(1, target as HTMLInputElement);
      expect(homeSettingService.clearHomePosition.calls.any()).toBe(false);
    });
  }));

  it('should update position failed when enter invalid number', async(() => {
    const target = { value: '20a' };
    fixture.detectChanges();
    comp.updatePosition(1, target as HTMLInputElement);
    fixture.whenStable().then(() => {
      expect(openSpy).toHaveBeenCalled();
    });
  }));

  it('should update position failed when enter valid number but equals to previous input', async(() => {
    homeSettingService.updateHomePostion.calls.reset();
    homeSettingService.updateHomePostion.and.returnValue(Right());
    fixture.detectChanges();
    const target = { value: '20' };
    comp.onFocus('20');
    comp.updatePosition(1, target as HTMLInputElement);
    fixture.whenStable().then(() => {
      expect(homeSettingService.updateHomePostion.calls.any()).toBe(false);
    });
  }));

  it('should update position failed when enter valid number but not equals to previous input with the same index and over limits', async(() => {
    homeSettingService.updateHomePostion.calls.reset();
    homeSettingService.updateHomePostion.and.returnValue(Right());
    fixture.detectChanges();
    const target = { value: '20' };
    comp.onFocus('30');
    comp.updatePosition(undefined, target as HTMLInputElement);
    fixture.whenStable().then(() => {
      expect(homeSettingService.updateHomePostion.calls.any()).toBe(false);
    });
  }));

  it('should update position failed when enter valid number but not equals to previous input with other index and over limits', async(() => {
    homeSettingService.updateHomePostion.calls.reset();
    homeSettingService.updateHomePostion.and.returnValue(Right());
    fixture.detectChanges();
    const target = { value: '20' };
    comp.onFocus('30');
    comp.updatePosition(1, target as HTMLInputElement);
    fixture.whenStable().then(() => {
      expect(homeSettingService.updateHomePostion.calls.any()).toBe(false);
    });
  }));

  it('should update position failed when enter valid number but not equals to previous input', async(() => {
    homeSettingService.updateHomePostion.calls.reset();
    homeSettingService.updateHomePostion.and.returnValue(Left('faliled'));
    fixture.detectChanges();
    const target = { value: '9' };
    comp.onFocus('30');
    comp.updatePosition(2, target as HTMLInputElement);
    fixture.whenStable().then(() => {
      expect(homeSettingService.updateHomePostion.calls.any()).toBe(false);
      homeSettingService.updateHomePostion.calls.reset();
      homeSettingService.updateHomePostion.and.returnValue(
        Right('successfully')
      );
    });
  }));
});
