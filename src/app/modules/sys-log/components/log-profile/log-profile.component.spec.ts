import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { fakeLog } from '../../enums/sys-log.model';
import { LogProfileComponent } from './log-profile.component';

describe('LogProfileComponent', () => {
  let component: LogProfileComponent;
  let fixture: ComponentFixture<LogProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogProfileComponent],
      imports: [SharedModule, UnitTestModule],
      providers: [ ]
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
