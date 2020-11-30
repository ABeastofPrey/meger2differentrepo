import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { NewPositionTriggerComponent } from './new-position-trigger.component';
import { TerminalService } from '../../../../home-screen/services/terminal.service';
import { EventEmitter } from '@angular/core';

describe('NewPositionTriggerComponent', () => {
  let component: NewPositionTriggerComponent;
  let fixture: ComponentFixture<NewPositionTriggerComponent>;

  const fakeMatDialog = jasmine.createSpyObj('MatDialogRef', ['close']);
  const closeSpy = fakeMatDialog.close;
  const terminalService = jasmine.createSpyObj('TerminalService', ['']);
  terminalService.sentCommandEmitter = new EventEmitter();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewPositionTriggerComponent],
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: fakeMatDialog },
        { provide: TerminalService, useValue: terminalService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPositionTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should give the expect pls name after close.', () => {
    component.name = 'FakePls';
    component.close();
    expect(closeSpy).toHaveBeenCalledWith('PT_FakePls');
  });
});
