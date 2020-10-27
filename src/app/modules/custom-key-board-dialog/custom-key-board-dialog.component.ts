import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fromEvent } from 'rxjs';
import { customKeyBoardType, InputType, LAYOUT_NUMBER, LAYOUT_STRING_LOWER,LAYOUT_STRING_CAPITAL, LAYOUT_STRING_SYMBOL, DATA_TYPE, CommandLocalType } from '../core/models/customKeyBoard/custom-key-board.model';
import { UtilsService } from '../core/services/utils.service';

@Component({
    selector: 'custom-key-board-dialog',
    templateUrl: './custom-key-board-dialog.component.html',
    styleUrls: ['./custom-key-board-dialog.component.scss']
})
export class CustomKeyBoardDialogComponent implements OnInit {
    
    public InputTypes = InputType;
    public value: string;
    public layout: string[][];
    public timeout: NodeJS.Timeout;
    public caseConversion: boolean = false;
    public keyBoardType: string = "";

    @ViewChild('customKeyBoard', { static: false }) customKeyBoard: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<CustomKeyBoardDialogComponent>,
        private utils: UtilsService
    ) { 
        this.dialogData.type === DATA_TYPE.String ? this.layout = LAYOUT_STRING_LOWER : this.layout = LAYOUT_NUMBER;
        // setTimeout(() => {
            this.keyBoardType = this.dialogData.type;
        // }, 0);
    }

    ngOnInit() {
        
    }

    ngAfterViewInit(): void {
        fromEvent(document, 'mousedown').subscribe(this.preventLoseFocus.bind(this));
        if(this.dialogData.isCommand) {
            localStorage.getItem(CommandLocalType.CommandList) ? "" : localStorage.setItem(CommandLocalType.CommandList,JSON.stringify([]));
            let localCommand = JSON.parse(localStorage.getItem(CommandLocalType.CommandList));
            localStorage.setItem(CommandLocalType.CommandList,JSON.stringify(localCommand));
            localStorage.setItem(CommandLocalType.CommandIndex,(JSON.parse(localStorage.getItem(CommandLocalType.CommandList)).length).toString());
        }
    }

    get getNegativeDisabled(): boolean {
        if(this.customKeyBoard) {
            if(this.customKeyBoard.numInput.nativeElement.selectionStart !== 0 || this.customKeyBoard.numInput.nativeElement.value.indexOf('-') > -1) {
                return true;
            }else {
                return false;
            }
        } else {
            return false;
        }
    }

    // Prevent the input box from losing focus
    private preventLoseFocus(e: any): void {
        (e.target.getAttribute('class') && e.target.getAttribute('class').indexOf("numInputKeyBoard") > -1) ? "" : e.preventDefault();
    }

    public touchstart(e: TouchEvent, value: string): void {
        switch (value) {
            case InputType.Enter:
                const numberType: boolean = this.dialogData.type === DATA_TYPE.Float || this.dialogData.type === DATA_TYPE.Int;
                const inputValue = numberType ? this.utils.parseFloatAchieve(this.customKeyBoard.getValue()) : this.customKeyBoard.getValue();
                this.setLocalCommand(inputValue);
                this.dialogRef.close(inputValue);
                break;
            case InputType.Top:
                this.customKeyBoard.setDefaultValue(InputType.Top);
                break;
            case InputType.Bottom:
                this.customKeyBoard.setDefaultValue(InputType.Bottom);
                break;
            case InputType.Forward: 
                this.letterConversion(!this.caseConversion);
                break;
            case InputType.Symbol:
                this.layout = LAYOUT_STRING_SYMBOL;
                break;
            case InputType.Back:
                this.letterConversion(this.caseConversion);
                break;
            case InputType.Left:
            case InputType.Right:
            case InputType.Delete:
                this.timeout = setInterval(() => {
                    this.customKeyBoard.setValue(value);
                }, 200)
            default:
                this.customKeyBoard.setValue(value);
                break;
        }
        e.preventDefault();
    }

    public touchend(): void {
        clearInterval(this.timeout);
    }

    private setLocalCommand(value: string): void {
        if(this.dialogData.isCommand) {
            localStorage.getItem(CommandLocalType.CommandList) ? "" : localStorage.setItem(CommandLocalType.CommandList,JSON.stringify([]));
            let localCommand = JSON.parse(localStorage.getItem(CommandLocalType.CommandList));
            if(localCommand.indexOf(value) > -1) {
                return;
            }
            localCommand.splice(localCommand.length,0,value);
            localStorage.setItem(CommandLocalType.CommandList,JSON.stringify(localCommand));
        }
    }

    private letterConversion(state: boolean): void {
        this.caseConversion = state;
        this.caseConversion ? this.layout = LAYOUT_STRING_CAPITAL : this.layout = LAYOUT_STRING_LOWER;
    }

    public close() {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {

    }

}
