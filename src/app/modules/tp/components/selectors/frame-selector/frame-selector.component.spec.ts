import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameSelectorComponent } from './frame-selector.component';

describe('FrameSelectorComponent', () => {
  let component: FrameSelectorComponent;
  let fixture: ComponentFixture<FrameSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrameSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
