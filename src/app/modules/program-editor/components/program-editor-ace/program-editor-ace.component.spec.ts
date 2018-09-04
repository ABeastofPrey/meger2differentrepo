import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramEditorAceComponent } from './program-editor-ace.component';

describe('ProgramEditorAceComponent', () => {
  let component: ProgramEditorAceComponent;
  let fixture: ComponentFixture<ProgramEditorAceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramEditorAceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramEditorAceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
