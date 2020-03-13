import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';
import { LogProfileComponent } from './log-profile.component';
import { SystemLogModule } from '../../sys-log.module';

describe('LogProfileComponent', () => {
  let component: LogProfileComponent;
  let fixture: ComponentFixture<LogProfileComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule, SystemLogModule],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogProfileComponent);
    component = fixture.componentInstance;
    component.log = fakeLog;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
