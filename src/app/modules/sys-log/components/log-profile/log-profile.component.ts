import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';

@Component({
    selector: 'app-log-profile',
    templateUrl: './log-profile.component.html',
    styleUrls: ['./log-profile.component.scss']
})
export class LogProfileComponent implements OnInit {
    @Input()log: SystemLog;

    constructor() { }

    ngOnInit(): void { }
}
