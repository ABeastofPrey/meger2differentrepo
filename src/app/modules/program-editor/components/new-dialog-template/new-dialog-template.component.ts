import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { List, DialogValue } from '../../services/vision.enum';
import { WebsocketService } from '../../../core';
@Component({
    selector: 'app-new-dialog-template',
    templateUrl: './new-dialog-template.component.html',
    styleUrls: ['./new-dialog-template.component.scss']
})
export class NewDialogTemplateComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<NewDialogTemplateComponent>, private ws: WebsocketService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    public name: FormControl = new FormControl('');
    public dialog: boolean = true;

    ngOnInit() {
        let vaild = [Validators.required, this.validFirstLetter(this.name), this.validExist(this.name)]
        this.name.setValidators(vaild);

    }

    validFirstLetter(name: FormControl) {
        return () => {
            let reg = /^[a-zA-Z]/;
            return (reg.test(name.value) ? null : { "letter": "letter" })
        }
    }

    validExist(name: FormControl) {
        return () => {
            let stationList: string[] = this.data.stationList;
            let existList = stationList.filter((value) => {
                return value === this.name.value.toUpperCase();
            })
            return ((existList.length === 0) ? null : { "exist": "exist" })
        }
    }

    changeInput(e: any): void {
        const [validName] = e.target.value.match(/[a-zA-Z0-9_]*/g);
        const name: string = validName.slice(0, 32);
        this.name.patchValue(name);
        this.name.markAsTouched();
    }

    change(value: string): void {
        this.name.patchValue(value);
        this.name.markAsTouched();
    }

    insert(): void {
        let addStation = `?AddStation("${this.name.value}")`;
        this.ws.query(addStation).then((result: List) => {
            if (result.result === "0") {
                this.close(true)
            } else {
                this.close(false);
            }
        })
    }

    close(status: boolean) {
        let nameDialog: DialogValue = {
            "name": this.name.value,
            // "dialog": this.dialog,
            "status": status
        }
        this.dialogRef.close(nameDialog);
    }

}
