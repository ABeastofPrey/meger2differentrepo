import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedChangerComponent } from './speed-changer.component';

describe('SpeedChangerComponent', () => {
  let component: SpeedChangerComponent;
  let fixture: ComponentFixture<SpeedChangerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeedChangerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedChangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
