import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatesDisplayComponent } from './coordinates-display.component';

describe('CoordinatesDisplayComponent', () => {
  let component: CoordinatesDisplayComponent;
  let fixture: ComponentFixture<CoordinatesDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoordinatesDisplayComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinatesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
