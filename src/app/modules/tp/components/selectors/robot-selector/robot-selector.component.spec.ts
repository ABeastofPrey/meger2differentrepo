import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotSelectorComponent } from './robot-selector.component';

describe('RobotSelectorComponent', () => {
  let component: RobotSelectorComponent;
  let fixture: ComponentFixture<RobotSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RobotSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
