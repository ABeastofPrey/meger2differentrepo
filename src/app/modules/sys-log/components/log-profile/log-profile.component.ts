import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { FwTranslatorService } from '../../../core/services/fw-translator.service';

@Component({
    selector: 'app-log-profile',
    templateUrl: './log-profile.component.html',
    styleUrls: ['./log-profile.component.scss']
})
export class LogProfileComponent implements OnInit {
    @Input() log: SystemLog;
    @Input() expanded: boolean = false;

        constructor(public trn: FwTranslatorService) { }

    ngOnInit(): void { }
}
