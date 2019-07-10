import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPassDialogComponent } from './auth-pass-dialog.component';

describe('AuthPassDialogComponent', () => {
  let component: AuthPassDialogComponent;
  let fixture: ComponentFixture<AuthPassDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthPassDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPassDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
