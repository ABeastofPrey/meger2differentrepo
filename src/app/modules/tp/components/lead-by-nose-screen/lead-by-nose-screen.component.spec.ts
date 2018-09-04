import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadByNoseScreenComponent } from './lead-by-nose-screen.component';

describe('LeadByNoseScreenComponent', () => {
  let component: LeadByNoseScreenComponent;
  let fixture: ComponentFixture<LeadByNoseScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadByNoseScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadByNoseScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
