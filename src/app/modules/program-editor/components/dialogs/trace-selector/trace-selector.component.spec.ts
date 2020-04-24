import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceSelectorComponent } from './trace-selector.component';

describe('TraceSelectorComponent', () => {
  let component: TraceSelectorComponent;
  let fixture: ComponentFixture<TraceSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraceSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
