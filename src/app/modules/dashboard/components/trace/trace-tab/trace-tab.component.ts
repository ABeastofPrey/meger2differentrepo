import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-trace-tab',
    templateUrl: './trace-tab.component.html',
    styleUrls: ['./trace-tab.component.scss']
})
export class TraceTabComponent implements OnInit {
    
    public canNotEdit: boolean = false;

    constructor() { }

    ngOnInit(): void { }

    public isDisableEidtHandler(e): void {
        this.canNotEdit = e;
    }
}
