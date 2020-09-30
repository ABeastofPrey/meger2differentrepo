import { CommonModule } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataService } from '../../../../../modules/core';
import { SharedModule } from '../../../../../modules/shared/shared.module';
import { UnitTestModule } from '../../../../../modules/shared/unit-test.module';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SelectFrameDialogComponent } from './select-frame-dialog.component';
import { FrameTypes } from '../../../../../modules/core/models/frames';
import { AddFrameComponent } from '../../add-frame/add-frame.component';
import { of } from 'rxjs/internal/observable/of';

@NgModule({
  imports: [CommonModule, SharedModule, BrowserAnimationsModule,],
  declarations: [AddFrameComponent],
  exports: [AddFrameComponent],
  entryComponents: [AddFrameComponent]
})
class FakeTestDialogModule { }

describe('SelectFrameDialogComponent', () => {
  let component: SelectFrameDialogComponent;
  let fixture: ComponentFixture<SelectFrameDialogComponent>;

  const dialogData = jasmine.createSpyObj('MAT_DIALOG_DATA', ['type']);
  dialogData.type = FrameTypes.TOOL;

  const mockDataService = jasmine.createSpyObj('DataService', ['refreshTools', 'refreshBases', 'bases', 'tools']);
  mockDataService.refreshTools.and.returnValue(Promise.resolve(true));
  mockDataService.refreshBases.and.returnValue(Promise.resolve(true));
  mockDataService.tools = ["tools"];
  mockDataService.bases = ["bases"];

  const mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UnitTestModule,
        SharedModule,
        FakeTestDialogModule,
        BrowserAnimationsModule,
      ],
      declarations: [SelectFrameDialogComponent],
      providers: [
        { provide: DataService, useValue: mockDataService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (dialogResult: any) => { },
          },
        }, {
          provide: MatDialog,
          useValue: mockMatDialog
        }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFrameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Select Tool', () => {
    it('SelectTool', fakeAsync(() => {
      dialogData.type = FrameTypes.TOOL;
      component.ngOnInit();
      tick(30);
      expect(component.title).not.toBeUndefined();
      component.onInsert();
      mockMatDialog.open.and.returnValue({ afterClosed: () => of({ name: 'ffff' }) });
      component.createFrame();
      tick();
    }));

    it('SelectBase', fakeAsync(() => {
      tick(150);//wait SelectTool finished
      dialogData.type = FrameTypes.BASE;
      component.ngOnInit();
      tick(50);
      expect(component.title).not.toBeUndefined();
      component.onInsert();
      tick(100);
      mockMatDialog.open.and.returnValue({ afterClosed: () => of(null) });
      component.createFrame();
      tick();
    }));
  });

});

