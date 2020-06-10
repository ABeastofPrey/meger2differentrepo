import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { DiagnosisComponent } from './diagnosis.component';
import { DiagnosisService } from '../../services/diagnosis.service';
import { MatDialog } from '@angular/material';
import { of, throwError } from 'rxjs';

const fakeService = jasmine.createSpyObj('DiagnosisService', [
    'prepare2Diagnosis', 'uploadFiles', 'prepareModuleVersion',
    'downloadZipFile', 'deleteFolder',
]);

fakeService.prepare2Diagnosis.and.returnValue(of(true));
fakeService.uploadFiles.and.returnValue(of(true));
fakeService.prepareModuleVersion.and.returnValue(of(true));
fakeService.downloadZipFile.and.returnValue(of(true));
const deleteFolderSpy = fakeService.deleteFolder.and.returnValue(of(true));

const fakeDialog = jasmine.createSpyObj('MatDialog', ['open']);
fakeDialog.open.and.returnValue({
    afterClosed: () => of(true),
    close: () => {},
    componentInstance: {
        title: '', value: 0, bufferValue: 0
    }
});

describe('DiagnosisComponent', () => {
    let component: DiagnosisComponent;
    let fixture: ComponentFixture<DiagnosisComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DiagnosisComponent],
            imports: [UnitTestModule],
            providers: [{
                provide: DiagnosisService, useValue: fakeService,
            }, {
                provide: MatDialog, useValue: fakeDialog
            }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiagnosisComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should diagnosis successful', () => {
        deleteFolderSpy.calls.reset();
        const div: HTMLDivElement = fixture.nativeElement.querySelector('div');
        div.dispatchEvent(new Event('click'));
        expect(deleteFolderSpy).toHaveBeenCalledTimes(1);
        deleteFolderSpy.calls.reset();
    });

    it('should diagnosis fail', () => {
        deleteFolderSpy.calls.reset();
        fakeService.downloadZipFile.and.returnValue(throwError(true));
        const div: HTMLDivElement = fixture.nativeElement.querySelector('div');
        div.dispatchEvent(new Event('click'));
        expect(deleteFolderSpy).toHaveBeenCalledTimes(0);
        deleteFolderSpy.calls.reset();
    });
});
