import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AxisVordComponent } from './axis-vord.component';

describe('AxisVordComponent', () => {
  let component: AxisVordComponent;
  let fixture: ComponentFixture<AxisVordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AxisVordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AxisVordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
