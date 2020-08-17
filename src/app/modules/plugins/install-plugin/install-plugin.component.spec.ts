import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import {
  InstallPluginComponent,
  PluginStepId,
  I18StepTitle,
} from './install-plugin.component';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  PluginsService,
  UnexpectionError,
  VersionState,
  DependenciesCheckState,
  DuplicationCheckState,
} from '../plugins.service';
import { UnitTestModule } from '../../shared/unit-test.module';
import { Right, ApiService, Left } from '../../core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';
import { Observable, of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

class MockPluginsService {
  filepath = '@TMPFOLDER';
  createPluginFolder(): Promise<any> {
    return Promise.resolve('Success');
  }
  uploadPluginConfigFile(): Promise<any> {
    return Promise.resolve('Success');
  }
  inStallIsReady(): Promise<any> {
    return Promise.resolve('Success');
  }
  pluginExistCheck(): Observable<any> {
    return of({
      state: VersionState.NotInstall,
      name: 'test',
      install: 'V1.0.0',
    });
  }
  pluginDependenciesCheck(): Observable<any> {
    return of({
      state: DependenciesCheckState.satisfied,
    });
  }
  duplicationCheck(): Observable<any> {
    return of({
      state: DuplicationCheckState.HasDuplicateFile,
      files: ['file'], //duplicate file name
    });
  }

  startInstallPlugin(): void { }

  setPluginInfo(): Observable<any> {
    return of('Success');
  }

  cancelPluginInstall(): Observable<any> {
    return of(Right(true));
  }

  readFile(file: File): Promise<any> {
    return Promise.resolve('Success');
  }
  loadJS(): void { }
}

describe('InstallPluginComponent', () => {
  let component: InstallPluginComponent;
  let fixture: ComponentFixture<InstallPluginComponent>;

  let mockPluginsService: PluginsService;

  let mockApiService = jasmine.createSpyObj('ApiService', ['uploadIPK']);

  let mockSysLogSnackBarService: SysLogSnackBarService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UnitTestModule,
        SharedModule,
        BrowserAnimationsModule,
      ],
      declarations: [InstallPluginComponent],
      providers: [
        { provide: PluginsService, useClass: MockPluginsService },
        { provide: ApiService, useValue: mockApiService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: new File([], 'test.zip'),
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (dialogResult: any) => { },
          },
        },
        {
          provide: SysLogSnackBarService,
          useValue: {
            openTipSnackBar: () => { },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    mockPluginsService = TestBed.get(PluginsService);
    mockSysLogSnackBarService = TestBed.get(SysLogSnackBarService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  let errorTips; //error info

  describe('version check succes', () => {
    it('not install,no install', () => { });
    it('version check has install diff version', () => {
      spyOn(mockPluginsService, 'pluginExistCheck').and.returnValue(
        of({ state: VersionState.DiffVersion })
      );
    });

    afterEach(fakeAsync(() => {
      component.ngOnInit();
      tick(0);
      expect(component.isBusy).toBeFalsy();
      expect(component.errorTips).toBe('', 'no error');
      expect(component.stepInfo.disabled).toBeFalsy();
    }));
  });

  describe('upload config file error or pluginExisCheck failed', () => {
    it('not install,same version', () => {
      spyOn(mockPluginsService, 'pluginExistCheck').and.returnValue(
        of({ state: VersionState.SameVersion })
      );
      errorTips = '';
    });

    // it('should display error info after upload file failed', fakeAsync(() => {
    //   errorTips = UnexpectionError.uploadFile;
    //   spyOn(mockPluginsService, 'readFile').and.returnValue(Promise.resolve({ error: errorTips }));
    // }));

    it('should display error info after pluginExistCheck failed #versionCheck', fakeAsync(() => {
      spyOn(mockPluginsService, 'pluginExistCheck').and.returnValue(of(false));
      errorTips = UnexpectionError.versionCheck;
    }));

    afterEach(fakeAsync(() => {
      component.ngOnInit();
      tick(0);
      expect(component.isBusy).toBeFalsy();
      expect(component.stepInfo.disabled).toBeTruthy();
      expect(component.errorTips).toBe(
        errorTips,
        'read file or pluginExistCheck error'
      );
    }));
  });

  describe('#onNext() should check after next button click #onNext', () => {
    describe('#onNext() pluginDependenciesCheck', () => {
      beforeEach(() => {
        component.stepInfo.disabled = true;
        component.errorTips = '';
        component.isBusy = true;
      });

      it('satisfied install conditions', () => {
        //default
      });

      it('unsatified install conditions', () => {
        spyOn(mockPluginsService, 'pluginDependenciesCheck').and.returnValue(
          of({
            state: DependenciesCheckState.unSatisfied,
            name: ['1'],
            require: ['1'],
            act: ['1'],
          })
        );
      });

      it('unsatified install conditions,not have name require act', () => {
        spyOn(mockPluginsService, 'pluginDependenciesCheck').and.returnValue(
          of({ state: DependenciesCheckState.unSatisfied })
        );
      });

      it('failed,has error', () => {
        spyOn(mockPluginsService, 'pluginDependenciesCheck').and.returnValue(
          of(null)
        );
      });

      afterEach(fakeAsync(() => {
        component.stepInfo.id = PluginStepId.HistoryCheck;
        const cancelEle: DebugElement = fixture.debugElement;
        const nextBtn = cancelEle.query(By.css('.nextBtn'));
        nextBtn.triggerEventHandler('click', component.onNext);
        tick(0);
        expect(component.isBusy).toBeFalsy();
      }));
    });

    describe('#onNext duplicationCheck', () => {
      beforeEach(() => {
        component.stepInfo.disabled = true;
        component.errorTips = '';
        component.isBusy = true;
      });
      it('has duplicate file', () => {
        expect(component.errorTips).toBe('', 'has error');
      });

      it('failed', () => {
        spyOn(mockPluginsService, 'duplicationCheck').and.returnValue(of(null));
      });

      afterEach(fakeAsync(() => {
        component.stepInfo.id = PluginStepId.DependenciesCheck;
        const cancelEle: DebugElement = fixture.debugElement;
        const nextBtn = cancelEle.query(By.css('.nextBtn'));
        nextBtn.triggerEventHandler('click', component.onNext);
        tick(0);
        expect(component.isBusy).toBeFalsy();
      }));
    });

    describe('#onNext Installation', () => {
      beforeEach(() => {
        component.stepInfo.disabled = true;
        component.errorTips = '';
        component.isBusy = true;
      });

      it('success', () => {
        mockApiService.uploadIPK.and.returnValue(
          Promise.resolve({ success: 1 })
        );
      });
      it('failed', () => {
        mockApiService.uploadIPK.and.returnValue(Promise.resolve(null));
      });

      it('unexpection error', () => {
        mockApiService.uploadIPK.and.returnValue(Promise.reject('error'));
      });

      afterEach(fakeAsync(() => {
        component.stepInfo.id = PluginStepId.DuplicateCheck;
        const cancelEle: DebugElement = fixture.debugElement;
        const nextBtn = cancelEle.query(By.css('.nextBtn'));
        nextBtn.triggerEventHandler('click', component.onNext);
        tick(0);
        expect(component.isBusy).toBeFalsy();
      }));
    });
  });

  it('#onCancel() should trigger #pluginService.cancelPluginInstall', fakeAsync(() => {
    const cancelEle: DebugElement = fixture.debugElement;
    const cancelBtn = cancelEle.query(By.css('.cancelBtn'));
    cancelBtn.triggerEventHandler('click', component.onCancel);
    tick();
    expect(component.stepInfo.cancelBtnDisabled).toBeFalsy();
  }));
});
