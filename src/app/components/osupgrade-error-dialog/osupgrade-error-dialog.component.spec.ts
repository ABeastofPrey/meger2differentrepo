import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material';

import { SharedModule } from './../../modules/shared/shared.module';
import { UnitTestModule } from './../../modules/shared/unit-test.module';
import { OSUpgradeErrorDialogComponent } from './osupgrade-error-dialog.component';

describe('OSUpgradeErrorDialogComponent', () => {
  let component: OSUpgradeErrorDialogComponent;
  let fixture: ComponentFixture<OSUpgradeErrorDialogComponent>;

  /**
   * The mock dialog.
   */
  const dialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, UnitTestModule, MatDialogModule],
      declarations: [ OSUpgradeErrorDialogComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Failed!',
          msg: 'The OS upgrade is failed. Please reinstall the old version: 1.1.0',
          guiVersion: '1.1.3', webServerVersion: '3.1.4', softMCVersion: '1.4.0', libraryVersion: '1.3.0'} },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OSUpgradeErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
