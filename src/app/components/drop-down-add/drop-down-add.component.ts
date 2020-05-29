import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';

@Component({
    selector: 'app-drop-down-add',
    templateUrl: './drop-down-add.component.html',
    styleUrls: ['./drop-down-add.component.scss']
})
export class DropDownAddComponent implements OnInit {

    @Input() lists: string[];
    @Input() selected: string;
    @Input() placeholder: string;
    @Input() title: string;
    @Input() msg: string;
    @Input() maxLimit: number;
    @Input() label: string;
    @Output() deleteEmit: EventEmitter<string> = new EventEmitter<string>();
    @Output() addEmit: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectEmit: EventEmitter<string> = new EventEmitter<string>();
    public addStatus: boolean = false;


    constructor(private dialog: MatDialog) { }

    ngOnInit() {

    }

    public add(event: MouseEvent): void {
        event.stopPropagation();
        this.addStatus = true;
    }

    public addLimit(event: MouseEvent): void {
        event.stopPropagation();
    }

    public cancel(event: MouseEvent): void {
        event.stopPropagation();
        this.addStatus = false;
    }

    public selectedTemplate(): void {
        this.selectEmit.emit(this.selected);
    }

    public createList(name: string): void {
        this.addStatus = false;
        this.addEmit.emit(name);
    }

    public delete(event: MouseEvent, list: string): void {
        event.stopPropagation();
        this.dialog.open(YesNoDialogComponent, {
            data: {
                title: this.title,
                titlePara: list,
                msg: this.msg,
                yes: 'button.delete', no: 'button.cancel',
            },
        }).afterClosed().subscribe(res => {
            if (res === true) {
                this.deleteEmit.emit(list);
            }
        });
    }

}
