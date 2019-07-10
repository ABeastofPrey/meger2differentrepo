import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentDialogComponent } from './ident-dialog.component';

describe('IdentDialogComponent', () => {
  let component: IdentDialogComponent;
  let fixture: ComponentFixture<IdentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdentDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
