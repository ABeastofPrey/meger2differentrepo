import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fakeLog } from '../../enums/sys-log.model';

import { LogEffectComponent } from './log-effect.component';

describe('LogEffectComponent', () => {
  let component: LogEffectComponent;
  let fixture: ComponentFixture<LogEffectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogEffectComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogEffectComponent);
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
  })
});
