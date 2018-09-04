import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProjectFileDialogComponent } from './new-project-file-dialog.component';

describe('NewProjectFileDialogComponent', () => {
  let component: NewProjectFileDialogComponent;
  let fixture: ComponentFixture<NewProjectFileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewProjectFileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewProjectFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
