import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotsComponent } from './robots.component';

describe('RobotsComponent', () => {
  let component: RobotsComponent;
  let fixture: ComponentFixture<RobotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
