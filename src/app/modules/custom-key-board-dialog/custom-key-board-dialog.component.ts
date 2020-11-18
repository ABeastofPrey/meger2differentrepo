import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fromEvent, Subject } from 'rxjs';
import {  InputType, LAYOUT_NUMBER, LAYOUT_NUMBER2,LAYOUT_STRING_LOWER,LAYOUT_STRING_CAPITAL, LAYOUT_STRING_SYMBOL, DATA_TYPE, CommandLocalType, ILayoutOfNumber } from '../core/models/customKeyBoard/custom-key-board.model';
import { UtilsService } from '../core/services/utils.service';

@Component({
    selector: 'custom-key-board-dialog',
    templateUrl: './custom-key-board-dialog.component.html',
    styleUrls: ['./custom-key-board-dialog.component.scss']
})
export class CustomKeyBoardDialogComponent implements OnInit,OnDestroy {

    public InputTypes = InputType;
    public value: string;
    public layout: string[][] | ILayoutOfNumber[][];
    public timeout: NodeJS.Timeout;
    public caseConversion: boolean = false;
    public keyBoardType: string = "";

    @ViewChild('customKeyBoard', { static: false }) customKeyBoard: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<CustomKeyBoardDialogComponent>,
        private utils: UtilsService
    ) {
        this.dialogData.type === DATA_TYPE.String ? this.layout = LAYOUT_STRING_LOWER : this.layout = LAYOUT_NUMBER2;
        // setTimeout(() => {
            this.keyBoardType = this.dialogData.type;
        // }, 0);
    }

    ngOnInit() { }

    ngOnDestroy(): void {
      this.timeout && clearInterval(this.timeout);
    }

    ngAfterViewInit(): void {
        fromEvent(document, 'mousedown').subscribe(this.preventLoseFocus.bind(this));
        const globalOverlayWrappers = document.getElementsByClassName('cdk-global-overlay-wrapper');
        globalOverlayWrappers[globalOverlayWrappers.length - 1].classList.add('hidden-mat-dialog-container');
    }

    get getNegativeDisabled(): boolean {
        if(this.customKeyBoard) {
            let newValue = this.customKeyBoard.numInput.nativeElement.value || '';
            if(this.customKeyBoard.numInput.nativeElement.selectionStart !== 0 ||  newValue.indexOf('-')> -1) {
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
      this.touchend();
        switch (value) {
            case InputType.Enter:
                const numberType: boolean = this.dialogData.type === DATA_TYPE.Float || this.dialogData.type === DATA_TYPE.Int;
                const inputValue = numberType ? this.utils.parseFloatAchieve(this.customKeyBoard.getValue()) : this.customKeyBoard.getValue();
                this.dialogRef.close({enter: true,value: inputValue});
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
      this.timeout && clearInterval(this.timeout);
    }

    private letterConversion(state: boolean): void {
        this.caseConversion = state;
        this.caseConversion ? this.layout = LAYOUT_STRING_CAPITAL : this.layout = LAYOUT_STRING_LOWER;
    }

    public close() {
        this.dialogRef.close();
    }

    public onLineDelete() {
        this.dialogRef.close({delete: true});
    }

    disabledKey(item: ILayoutOfNumber): boolean{
      if(!this.customKeyBoard || !item.checkStatus) return false;
      const dialogData = this.dialogData;
      const customKeyBoard = this.customKeyBoard;
      let disabled = false;
      let value = customKeyBoard.getValue();
      if(value === null || value === undefined){
        value = '';
      }else{
        value = value.toString();
      }
      switch(item.value){
        case '-':
          disabled = dialogData.isPositiveNum || this.getNegativeDisabled;
          break;
        case '.':
          disabled = dialogData.type === DATA_TYPE.Int || (dialogData.type !== DATA_TYPE.String && (value.indexOf('.') > -1));
          break;
        case InputType.Enter:
          disabled = !customKeyBoard.getValid();
          break;
          default:
            disabled = false;
      }
     return disabled
    }



}
