import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletizingComponent } from './palletizing.component';

describe('PalletizingComponent', () => {
  let component: PalletizingComponent;
  let fixture: ComponentFixture<PalletizingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PalletizingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
