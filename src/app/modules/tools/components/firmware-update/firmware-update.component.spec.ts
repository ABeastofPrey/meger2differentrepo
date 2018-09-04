import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareUpdateComponent } from './firmware-update.component';

describe('FirmwareUpdateComponent', () => {
  let component: FirmwareUpdateComponent;
  let fixture: ComponentFixture<FirmwareUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirmwareUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirmwareUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
