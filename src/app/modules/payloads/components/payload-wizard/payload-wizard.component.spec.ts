import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayloadWizardComponent } from './payload-wizard.component';

describe('PayloadWizardComponent', () => {
  let component: PayloadWizardComponent;
  let fixture: ComponentFixture<PayloadWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PayloadWizardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
