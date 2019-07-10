import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GripperSelectorComponent } from './gripper-selector.component';

describe('GripperSelectorComponent', () => {
  let component: GripperSelectorComponent;
  let fixture: ComponentFixture<GripperSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GripperSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GripperSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
