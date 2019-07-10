import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolCalibrationDialogComponent } from './tool-calibration-dialog.component';

describe('ToolCalibrationDialogComponent', () => {
  let component: ToolCalibrationDialogComponent;
  let fixture: ComponentFixture<ToolCalibrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToolCalibrationDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolCalibrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
