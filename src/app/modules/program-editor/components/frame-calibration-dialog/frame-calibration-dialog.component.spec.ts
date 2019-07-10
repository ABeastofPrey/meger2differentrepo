import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameCalibrationDialogComponent } from './frame-calibration-dialog.component';

describe('FrameCalibrationDialogComponent', () => {
  let component: FrameCalibrationDialogComponent;
  let fixture: ComponentFixture<FrameCalibrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrameCalibrationDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameCalibrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
