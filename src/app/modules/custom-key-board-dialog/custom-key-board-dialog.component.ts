import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fromEvent } from 'rxjs';
import { customKeyBoardType, InputType } from '../core/models/customKeyBoard/custom-key-board.model';

@Component({
  selector: 'custom-key-board-dialog',
  templateUrl: './custom-key-board-dialog.component.html',
  styleUrls: ['./custom-key-board-dialog.component.scss']
})
export class CustomKeyBoardDialogComponent implements OnInit {



  @ViewChild('customKeyBoard', { static: false }) customKeyBoard: customKeyBoardType;

  public InputTypes = InputType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<CustomKeyBoardDialogComponent>
  ) { }

  public value: string;
  public layout: string[][];
  public timeout: NodeJS.Timeout;

  ngOnInit() {
    this.layout = LAYOUT_NUMBER;
  }

  ngAfterViewInit(): void {
    fromEvent(document, 'mousedown').subscribe(this.preventLoseFocus.bind(this));
  }

  // Prevent the input box from losing focus
  private preventLoseFocus(e: any): void {
    (e.target.getAttribute('class') && e.target.getAttribute('class').indexOf("numInputKeyBoard") > -1) ? "" : e.preventDefault();
  }

  public touchstart(e: TouchEvent, value: string): void {
    switch (value) {
      case InputType.Enter:
        this.dialogRef.close(this.parseFloatAchieve(this.customKeyBoard.getValue()));
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

  public close() {
    this.dialogRef.close();
  }

  private parseFloatAchieve(originValue: string): string {
    let head: number = 0;
    let foot: number = originValue.length;
    for (let i = 0; i < originValue.length - 1; i++) {
      if (originValue[i] == "0") {
        head++;
      } else {
        break;
      }
    }
    originValue = originValue.slice(head);
    originValue = originValue[0] === '.' ? `0${originValue}` : originValue;
    let negative = 0;
    if (originValue[0] == "-") {
      for (let z = 1; z < originValue.length - 1; z++) {
        if (originValue[z] == "0") {
          negative++;
        } else {
          break;
        }
      }
      originValue = originValue[0] + originValue.slice(negative + 1);
    }
    originValue = (originValue[0] === '-' && originValue[1] === '.') ? `-0${originValue.slice(1)}` : originValue;
    let originValueArray = originValue.split(".");
    if (originValueArray.length == 2) {
      for (let j = originValueArray[1].length - 1; j > 0; j--) {
        if (originValueArray[1][j] == "0") {
          foot--;
        } else {
          break;
        }
      }
    }
    originValue = originValue.slice(0, foot);
    originValue = originValue[originValue.length - 1] === '.' ? `${originValue.slice(0, originValue.length - 1)}` : originValue;
    return originValue;
  }

  ngOnDestroy(): void {

  }

}

const LAYOUT_NUMBER: string[][] = [
  ["7", "8", "9", InputType.Delete],
  ["4", "5", "6", "-"],
  ["1", "2", "3", InputType.Enter],
  ["0", ".", InputType.Left, InputType.Right]
]
