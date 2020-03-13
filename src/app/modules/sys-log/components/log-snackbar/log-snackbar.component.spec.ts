import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';
import { SYS_LOG_SNAKBAR_DATA, SYS_LOG_SNAKBAR_COUNT } from '../../enums/sys-log.tokens';
import { LogSnackbarComponent } from './log-snackbar.component';

describe('LogSnackbarComponent', () => {
  let component: LogSnackbarComponent;
  let fixture: ComponentFixture<LogSnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogSnackbarComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
      providers: [
        { provide: SYS_LOG_SNAKBAR_DATA, useValue: fakeLog },
        { provide: SYS_LOG_SNAKBAR_COUNT, useValue: 2 },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogSnackbarComponent);
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
    component.confirmEvent.subscribe(id => {
      expect(id).toEqual(fakeLog.id);
    })
    component.clickConform();
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
});
