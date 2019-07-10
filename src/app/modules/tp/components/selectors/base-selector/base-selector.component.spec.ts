import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSelectorComponent } from './base-selector.component';

describe('BaseSelectorComponent', () => {
  let component: BaseSelectorComponent;
  let fixture: ComponentFixture<BaseSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
