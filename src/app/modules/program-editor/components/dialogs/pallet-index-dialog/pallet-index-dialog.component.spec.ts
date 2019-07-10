import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletIndexDialogComponent } from './pallet-index-dialog.component';

describe('PalletIndexDialogComponent', () => {
  let component: PalletIndexDialogComponent;
  let fixture: ComponentFixture<PalletIndexDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PalletIndexDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletIndexDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
