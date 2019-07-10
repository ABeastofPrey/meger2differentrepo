import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletLevelDesignerComponent } from './pallet-level-designer.component';

describe('PalletLevelDesignerComponent', () => {
  let component: PalletLevelDesignerComponent;
  let fixture: ComponentFixture<PalletLevelDesignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PalletLevelDesignerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletLevelDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
