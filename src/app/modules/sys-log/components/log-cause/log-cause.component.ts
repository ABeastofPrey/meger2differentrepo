import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-log-cause',
    templateUrl: './log-cause.component.html',
    styleUrls: ['./log-cause.component.scss']
})
export class LogCauseComponent implements OnInit {
    @Input() log: SystemLog;
    public canExpand = false;
    public possiableCauses: { cause: string, solution: string, description: string[] }[];
    constructor(private trn: TranslateService) { }

    ngOnInit(): void {
        const trnString = `err_code.${this.log.code}.possiable_causes`;
        this.trn.get([trnString]).subscribe(words => {
            const notFind = words[trnString] === trnString;
            this.possiableCauses = notFind ? [] : words[trnString];
            setTimeout(() => {
                this.canExpand = true;
            }, 50);
        });
    }
}
