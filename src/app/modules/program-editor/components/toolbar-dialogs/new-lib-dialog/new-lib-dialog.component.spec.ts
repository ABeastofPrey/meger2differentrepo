import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLibDialogComponent } from './new-lib-dialog.component';

describe('NewLibDialogComponent', () => {
  let component: NewLibDialogComponent;
  let fixture: ComponentFixture<NewLibDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewLibDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLibDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
