import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrakeTestComponent } from './brake-test.component';

describe('BrakeTestComponent', () => {
  let component: BrakeTestComponent;
  let fixture: ComponentFixture<BrakeTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrakeTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrakeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
