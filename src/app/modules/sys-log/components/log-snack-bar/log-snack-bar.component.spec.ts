import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';
import { SYS_LOG_SNAKBAR_LOG, SYS_LOG_SNAKBAR_COUNT, SYS_LOG_SNAKBAR_TIP } from '../../enums/sys-log.tokens';
import { LogSnackBarComponent } from './log-snack-bar.component';
import { TpStatService } from '../../../core/services/tp-stat.service';

describe('LogSnackBarComponent', () => {
  let component: LogSnackBarComponent;
  let fixture: ComponentFixture<LogSnackBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogSnackBarComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
      providers: [
        { provide: SYS_LOG_SNAKBAR_TIP, useValue: 'Hello world' },
        { provide: SYS_LOG_SNAKBAR_LOG, useValue: fakeLog },
        { provide: SYS_LOG_SNAKBAR_COUNT, useValue: 2 },
        { provide: TpStatService, useValue: { onlineStatus: { value: true } } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clickQuestionMark', async(() => {
    component.questionMarkEvent.subscribe(res => {
      expect(res.id).toEqual(fakeLog.id);
    });
    component.clickQuestionMark();
  }));

  it('should emit clickConform', () => {
    component.confirmEvent.subscribe(log => {
      expect(log.id).toEqual(fakeLog.id);
    })
    component.clickConform({ stopPropagation: () => { } } as any);
  });

  it('should emit clickConformAll', () => {
    component.confirmAllEvent.subscribe(id => {
      expect(id).toEqual(fakeLog.id);
    });
    component.clickConformAll();
  });

  it('should emit clickContent', () => {
    component.contentEvent.subscribe(id => {
      expect(id).toEqual(fakeLog.id);
    });
    component.clickContent();
  });

  it('should set tip success', () => {
    const tip = 'Hello world';
    fixture.detectChanges();
    component.setTip(tip);
    expect(component.tip).toEqual(tip);
  });

  it('should set log', () => {
    component.setLog(fakeLog, 100, true);
    expect(component.unconfirmCount).toEqual(100);
  });

  it('should destroy snack bar', () => {
    component.setTip('');
    component.destroySnackBar();
    expect(component.tip).toEqual('');
    
    component.setTip('Hello');
    component.destroySnackBar();
    expect(component.tip).toEqual('Hello');
  });
});
