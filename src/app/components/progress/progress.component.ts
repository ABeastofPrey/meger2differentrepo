import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { isNotNil } from 'ramda-adjunct';

@Component({
    selector: 'cs-progress',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class CSProgressComponent implements OnInit {
    @Input() title: string = '';
    @Input() value: number = 0;
    @Input() bufferValue: number = 0;
    @Input() autoClose: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string;
            value: number;
            bufferValue: number;
        }
    ) { 
        this.title = data.title ? data.title : this.title;
        this.value = isNotNil(data.value) ? data.value : this.value;
        this.bufferValue = isNotNil(data.bufferValue) ? data.bufferValue : this.bufferValue;
    }

    ngOnInit(): void { }
}
