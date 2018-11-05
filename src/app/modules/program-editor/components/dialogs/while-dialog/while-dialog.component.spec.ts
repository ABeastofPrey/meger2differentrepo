import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhileDialogComponent } from './while-dialog.component';

describe('WhileDialogComponent', () => {
  let component: WhileDialogComponent;
  let fixture: ComponentFixture<WhileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
