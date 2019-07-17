import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material';

import { SharedModule } from './../../modules/shared/shared.module';
import { UnitTestModule } from './../../modules/shared/unit-test.module';
import { OSUpgradeSuccessDialogComponent } from './osupgrade-success-dialog.component';

describe('OSUpgradeSuccessDialogComponent', () => {
  let component: OSUpgradeSuccessDialogComponent;
  let fixture: ComponentFixture<OSUpgradeSuccessDialogComponent>;

  /**
   * The mock dialog.
   */
  const dialogRef = {
    close: jasmine.createSpy('close'),
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, UnitTestModule, MatDialogModule],
      declarations: [OSUpgradeSuccessDialogComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Success!',
          msg: 'The OS upgrade is successful. The new version is: 1.1.0',
          guiVersion: '1.1.3', webServerVersion: '3.1.4', softMCVersion: '1.4.0', libraryVersion: '1.3.0'} },
        { provide: MatDialogRef, useValue: dialogRef }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OSUpgradeSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
