import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourWelcomeComponent } from './tour-welcome.component';

describe('TourWelcomeComponent', () => {
  let component: TourWelcomeComponent;
  let fixture: ComponentFixture<TourWelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourWelcomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
