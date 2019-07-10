import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPieceSelectorComponent } from './work-piece-selector.component';

describe('WorkPieceSelectorComponent', () => {
  let component: WorkPieceSelectorComponent;
  let fixture: ComponentFixture<WorkPieceSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkPieceSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPieceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
