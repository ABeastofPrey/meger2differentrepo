import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomIOComponent } from './custom-io.component';

describe('CustomIOComponent', () => {
  let component: CustomIOComponent;
  let fixture: ComponentFixture<CustomIOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomIOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomIOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
