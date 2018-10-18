import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GripperTestDialogComponent } from './gripper-test-dialog.component';

describe('GripperTestDialogComponent', () => {
  let component: GripperTestDialogComponent;
  let fixture: ComponentFixture<GripperTestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GripperTestDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GripperTestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
