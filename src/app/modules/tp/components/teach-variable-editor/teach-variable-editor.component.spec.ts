import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachVariableEditorComponent } from './teach-variable-editor.component';

describe('TeachVariableEditorComponent', () => {
  let component: TeachVariableEditorComponent;
  let fixture: ComponentFixture<TeachVariableEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeachVariableEditorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachVariableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
