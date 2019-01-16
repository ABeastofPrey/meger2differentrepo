import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material';
import { NewPositionTriggerComponent } from './new-position-trigger.component';
import { map, range, always } from 'ramda';

describe('NewPositionTriggerComponent', () => {
  let component: NewPositionTriggerComponent;
  let fixture: ComponentFixture<NewPositionTriggerComponent>;

  const fakeMatDialog = jasmine.createSpyObj('MatDialogRef', ['close']);
  const closeSpy = fakeMatDialog.close;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPositionTriggerComponent ],
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [{provide: MatDialogRef, useValue: fakeMatDialog}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPositionTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cannot create with null or undefined name.', () => {
      component.name = null;
      expect(component.canNotCreate).toBeTruthy();
      component.name = undefined;
      expect(component.canNotCreate).toBeTruthy();
  });

  it('should can create with gived name.', () => {
      component.name = 'PTName';
      component.nameControl = jasmine.createSpyObj('nameControl', ['hasError']);
      expect(component.canNotCreate).toBeFalsy();
  });

  it('should give the expect pls name after close.', () => {
      component.name = 'FakePls';
      component.close();
      expect(closeSpy).toHaveBeenCalledWith('PT_FakePls');
  });

  it('should not enter number when pressing shift.', () => {
      const shiftKeyCode = 16;
      const numberKeyCode = 50;
      const letterKeyCode = 70;
      component.onKeyDown(shiftKeyCode);
      expect(component.onKeyDown(numberKeyCode)).toBeFalsy();
      expect(component.onKeyDown(letterKeyCode)).toBeTruthy();
  });

  it('should can enter number when unpressing shift.', () => {
      const shiftKeyCode = 16;
      const numberKeyCode = 50;
      const letterKeyCode = 70;
      component.onKeyUp(shiftKeyCode);
      expect(component.onKeyDown(numberKeyCode)).toBeTruthy();
      expect(component.onKeyDown(letterKeyCode)).toBeTruthy();
  });

  it('should cannot enter anything when name over limitation but can delete character.', () => {
      const backSpaceKeyCode = 8;
      const numberKeyCode = 50;
      const letterKeyCode = 70;
      const name = map(always('a'), (range(0, 24)));
      component.name = name;
      expect(component.onKeyDown(backSpaceKeyCode)).toBeTruthy();
      expect(component.onKeyDown(numberKeyCode)).toBeFalsy();
      expect(component.onKeyDown(letterKeyCode)).toBeFalsy();
  });
});
