import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TraceTabComponent } from './trace-tab.component';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({selector: 'app-trace-common', template: ''})
export class TraceCommonComponent { }

@Component({selector: 'app-trace-trigger', template: ''})
export class TraceTriggerComponent { }

@Component({selector: 'app-trace-channel', template: ''})
export class TraceChannelComponent { }

describe('TraceTabComponent', () => {
  let component: TraceTabComponent;
  let fixture: ComponentFixture<TraceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TraceTabComponent, TraceCommonComponent, TraceTriggerComponent, TraceChannelComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.isDisableEidtHandler(true);
    expect(component).toBeTruthy();
  });
});
