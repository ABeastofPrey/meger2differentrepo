import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, tap, debounceTime } from 'rxjs/operators';
import { DiagnosisService } from '../../services/diagnosis.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { CSProgressComponent } from '../../../../components/progress/progress.component';

@Component({
    selector: 'cs-diagnosis',
    templateUrl: './diagnosis.component.html',
    styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit, AfterViewInit {
    @ViewChild('diagnosis', { static: true }) diagnosis: ElementRef;

    constructor(private service: DiagnosisService, private dialog: MatDialog) { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        fromEvent(this.diagnosis.nativeElement, 'click').subscribe(() => {
            this.dialog.open(YesNoDialogComponent, {
                width: '500px',
                hasBackdrop: true,
                disableClose: true,
                closeOnNavigation: false,
                data: {
                    title: 'diagnosis.confirmDialogTitle',
                    msg: 'diagnosis.confirmDialogMsg',
                    yes: 'button.ok', no: 'button.cancel',
                }
            }).afterClosed().subscribe(yes => {
                yes && this.startDiagnosis();
            });
        });
    }

    private startDiagnosis(): void {
        const ref: MatDialogRef<CSProgressComponent> = this.dialog.open(CSProgressComponent, {
            width: '500px',
            hasBackdrop: true,
            disableClose: true,
            closeOnNavigation: false,
            data: {
                title: 'diagnosis.prepareDiagnosis',
                value: 5, bufferValue: 7
            }
        });
        this.service.prepare2Diagnosis().pipe(
            tap(() => { 
                ref.componentInstance.title = 'diagnosis.generatingFiles';
                ref.componentInstance.value = 20; 
                ref.componentInstance.bufferValue = 25 
            }),
            switchMap(this.service.uploadFiles.bind(this.service)),
            tap(() => { 
                ref.componentInstance.value = 40; 
                ref.componentInstance.bufferValue = 45 
            }),
            switchMap(this.service.prepareModuleVersion.bind(this.service)),
            tap(() => { 
                ref.componentInstance.title = 'diagnosis.downloadZipFile';
                ref.componentInstance.value = 65; 
                ref.componentInstance.bufferValue = 70 
            }),
            switchMap(this.service.downloadZipFile.bind(this.service)),
            tap(() => { 
                ref.componentInstance.value = 95; 
                ref.componentInstance.bufferValue = 97 
            }),
            switchMap(this.service.deleteFolder.bind(this.service)),
            tap(() => { 
                ref.componentInstance.title = 'diagnosis.complete';
                ref.componentInstance.value = 100; 
                ref.componentInstance.bufferValue = 0 
            }),
            debounceTime(500),
        ).subscribe({
            next: success => {
                ref.close();
                console.log('Diagnosis finished.');
            },
            error: error => {
                ref.close();
                console.warn(error);
            }
        });
    }
}
