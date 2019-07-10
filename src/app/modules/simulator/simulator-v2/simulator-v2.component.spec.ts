import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorV2Component } from './simulator-v2.component';

describe('SimulatorV2Component', () => {
  let component: SimulatorV2Component;
  let fixture: ComponentFixture<SimulatorV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SimulatorV2Component],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
