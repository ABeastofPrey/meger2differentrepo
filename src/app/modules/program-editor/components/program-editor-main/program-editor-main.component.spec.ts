import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramEditorMainComponent } from './program-editor-main.component';

describe('ProgramEditorMainComponent', () => {
  let component: ProgramEditorMainComponent;
  let fixture: ComponentFixture<ProgramEditorMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramEditorMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramEditorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
