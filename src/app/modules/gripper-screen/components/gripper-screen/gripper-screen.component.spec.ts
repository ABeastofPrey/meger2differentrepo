import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GripperScreenComponent } from './gripper-screen.component';

describe('GripperScreenComponent', () => {
  let component: GripperScreenComponent;
  let fixture: ComponentFixture<GripperScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GripperScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GripperScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
