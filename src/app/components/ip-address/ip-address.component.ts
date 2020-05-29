import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { isUndefined } from 'ramda-adjunct';


@Component({
    selector: 'app-ip-address',
    templateUrl: './ip-address.component.html',
    styleUrls: ['./ip-address.component.scss']
})
export class IpAddressComponent implements OnInit {

    @Output() changeIpEmit: EventEmitter<string> = new EventEmitter<string>();
    @Input() ip: string;

    constructor() { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        (({ ip }) => {
            if (isUndefined(ip)) return;
            let matFormField: HTMLElement = document.getElementById("matFormField");
            let labels: HTMLCollection = matFormField.getElementsByClassName("mat-form-field-label")
            for (let i = 0; i < labels.length; i++) {
                labels[i]["style"]["display"] = "block"
            }
        })(changes);
    }

    public changeIp(event: string): void {
        this.changeIpEmit.emit(event);
    }

}
