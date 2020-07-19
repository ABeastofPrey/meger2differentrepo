import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayloadResultsComponent } from './payload-results.component';

describe('PayloadResultsComponent', () => {
  let component: PayloadResultsComponent;
  let fixture: ComponentFixture<PayloadResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayloadResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
