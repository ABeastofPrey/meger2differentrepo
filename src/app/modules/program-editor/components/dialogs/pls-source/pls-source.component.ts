import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Jump3DialogService } from '../../../services/jump3-dialog.service';

@Component({
    selector: 'app-pls-source',
    templateUrl: './pls-source.component.html',
    styleUrls: ['./pls-source.component.scss']
})
export class PLSSourceComponent implements OnInit {
    public motionElements: string[];
    public motionElement: string;
    public source: string = 'PathLength';
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>,
        private jumpService: Jump3DialogService
    ) { }

    async ngOnInit(): Promise<void> {
        this.motionElements = await this.jumpService.retriveMotionElements();
        this.motionElement = this.motionElements[0];
    }

    public emitCmd(): void {
        this.dialogRef.close(`${this.motionElement}.plssource=${this.source}`);
    }
}
