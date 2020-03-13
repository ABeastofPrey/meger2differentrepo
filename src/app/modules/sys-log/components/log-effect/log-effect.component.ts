import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-log-effect',
    templateUrl: './log-effect.component.html',
    styleUrls: ['./log-effect.component.scss']
})
export class LogEffectComponent implements OnInit {
    @Input() log: SystemLog;
    public effects: string[];
    constructor(private trn: TranslateService) { }

    ngOnInit(): void {
        const trnString = `err_code.${this.log.code}.effects`;
        this.trn.get([trnString]).subscribe(words => {
            const notFind = words[trnString] === trnString;
            this.effects = notFind ? [] : words[trnString];
        });
    }
}
