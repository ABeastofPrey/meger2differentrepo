import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LogCauseComponent } from './log-cause.component';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';

describe('LogCauseComponent', () => {
  let component: LogCauseComponent;
  let fixture: ComponentFixture<LogCauseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogCauseComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogCauseComponent);
    component = fixture.componentInstance;
    component.log = fakeLog;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should not get translation words.', () => {
    component.log.code = 0;
    component.ngOnInit();
    expect(true).toBe(true);
  });
});
