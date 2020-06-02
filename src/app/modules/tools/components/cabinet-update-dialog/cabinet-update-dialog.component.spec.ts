import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinetUpdateDialogComponent } from './cabinet-update-dialog.component';

describe('CabinetUpdateDialogComponent', () => {
  let component: CabinetUpdateDialogComponent;
  let fixture: ComponentFixture<CabinetUpdateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CabinetUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CabinetUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
