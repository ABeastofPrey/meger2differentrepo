import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletWizardComponent } from './pallet-wizard.component';

describe('PalletWizardComponent', () => {
  let component: PalletWizardComponent;
  let fixture: ComponentFixture<PalletWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PalletWizardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
