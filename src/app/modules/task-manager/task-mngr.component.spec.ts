import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMngrComponent } from './task-mngr.component';

describe('TaskMngrComponent', () => {
  let component: TaskMngrComponent;
  let fixture: ComponentFixture<TaskMngrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskMngrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskMngrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
