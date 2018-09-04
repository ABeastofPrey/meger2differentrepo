import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicEditorSideMenuComponent } from './graphic-editor-side-menu.component';

describe('GraphicEditorSideMenuComponent', () => {
  let component: GraphicEditorSideMenuComponent;
  let fixture: ComponentFixture<GraphicEditorSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphicEditorSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicEditorSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
