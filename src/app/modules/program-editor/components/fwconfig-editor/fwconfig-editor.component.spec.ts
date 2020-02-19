import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FwconfigEditorComponent } from './fwconfig-editor.component';

describe('FwconfigEditorComponent', () => {
  let component: FwconfigEditorComponent;
  let fixture: ComponentFixture<FwconfigEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FwconfigEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FwconfigEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
