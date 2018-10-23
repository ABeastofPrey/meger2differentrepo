import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFrameComponent } from './add-frame.component';

describe('AddFrameComponent', () => {
  let component: AddFrameComponent;
  let fixture: ComponentFixture<AddFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
