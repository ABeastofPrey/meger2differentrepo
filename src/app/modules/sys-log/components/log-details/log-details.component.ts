import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';

@Component({
    selector: 'app-log-details',
    templateUrl: './log-details.component.html',
    styleUrls: ['./log-details.component.scss']
})
export class LogDetailsComponent implements OnInit {
    @Input() log: SystemLog;
    
    constructor() { }

    ngOnInit(): void { }
}
