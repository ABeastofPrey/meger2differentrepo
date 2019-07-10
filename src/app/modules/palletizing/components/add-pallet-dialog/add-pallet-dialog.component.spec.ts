import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPalletDialogComponent } from './add-pallet-dialog.component';

describe('AddPalletDialogComponent', () => {
  let component: AddPalletDialogComponent;
  let fixture: ComponentFixture<AddPalletDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddPalletDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPalletDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
