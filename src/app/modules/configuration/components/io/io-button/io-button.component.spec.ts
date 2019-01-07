import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoButtonComponent } from './io-button.component';

describe('IoButtonComponent', () => {
  let component: IoButtonComponent;
  let fixture: ComponentFixture<IoButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
