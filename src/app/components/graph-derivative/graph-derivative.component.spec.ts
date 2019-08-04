import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDerivativeComponent } from './graph-derivative.component';

describe('GraphDerivativeComponent', () => {
  let component: GraphDerivativeComponent;
  let fixture: ComponentFixture<GraphDerivativeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GraphDerivativeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphDerivativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
