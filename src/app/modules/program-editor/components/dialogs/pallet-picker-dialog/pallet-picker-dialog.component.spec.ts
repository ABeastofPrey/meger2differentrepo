import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletPickerDialogComponent } from './pallet-picker-dialog.component';

describe('PalletPickerDialogComponent', () => {
  let component: PalletPickerDialogComponent;
  let fixture: ComponentFixture<PalletPickerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalletPickerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
