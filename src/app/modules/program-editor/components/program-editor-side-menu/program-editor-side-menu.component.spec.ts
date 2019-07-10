import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramEditorSideMenuComponent } from './program-editor-side-menu.component';

describe('ProgramEditorSideMenuComponent', () => {
  let component: ProgramEditorSideMenuComponent;
  let fixture: ComponentFixture<ProgramEditorSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgramEditorSideMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramEditorSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
