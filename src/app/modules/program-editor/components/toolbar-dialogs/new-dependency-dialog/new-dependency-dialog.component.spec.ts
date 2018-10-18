import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDependencyDialogComponent } from './new-dependency-dialog.component';

describe('NewDependencyDialogComponent', () => {
  let component: NewDependencyDialogComponent;
  let fixture: ComponentFixture<NewDependencyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDependencyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDependencyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
