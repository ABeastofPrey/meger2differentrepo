import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import {
  DataService,
  WebsocketService,
  CoordinatesService,
  MCQueryResponse,
} from '../../../core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'add-var',
  templateUrl: './add-var.component.html',
  styleUrls: ['./add-var.component.css'],
})
export class AddVarComponent implements OnInit {
  name: string;
  varType: string;
  values: any[];
  isArray: boolean = false;
  arrSize: number = 0;
  @Input() hotVariableOption: (0 | 1)[] = [1, 1, 1, 1, 1];
  @Input() canUseArray: boolean = true;

  private words: any;

  constructor(
    public dialogRef: MatDialogRef<AddVarComponent>,
    public data: DataService,
    private ws: WebsocketService,
    public coos: CoordinatesService,
    private snackbar: MatSnackBar,
    private trn: TranslateService,
    @Inject(MAT_DIALOG_DATA) public para: any
  ) {
    this.varType = this.para.varType || 'JOINT';
    if (this.para.useAsProjectPoints) {
      this.hotVariableOption = [1, 0, 0, 0, 0];
    }
    if (this.para.hotVariableOption) {
      this.hotVariableOption = this.para.hotVariableOption;
    }
    if (this.para.canUseArray !== undefined && this.para.canUseArray !== null) {
      this.canUseArray = this.para.canUseArray;
    }

    if (this.data.domainIsFrame) this.varType = 'LOCATION';
    this.trn.get(['success']).subscribe(words => {
      this.words = words;
    });
  }

  public isHotOption(index: number): boolean {
    return this.hotVariableOption[index] === 1 ? true : false;
  }

  ngOnInit() {
    this.values = this.data.robotCoordinateType.all.map(l => {
      return '0';
    });
  }

  onTypeChange() {
    if (this.varType === 'STRING') this.values[0] = '';
    else this.values[0] = '0';
  }

  closeDialog() {
    this.dialogRef.close(this.name && this.name.toUpperCase());
  }

  add(): Promise<any> {
    let name = this.isArray ? this.name + '[' + this.arrSize + ']' : this.name;
    let value: string = '';
    if (!this.isArray) {
      const legendSize =
        this.varType === 'JOINT' || this.varType === 'LOCATION'
          ? this.data.robotCoordinateType.legends.length
          : 1;
      value = this.values.slice(0, legendSize).join();
      if (this.varType === 'LOCATION') {
        value += ';' + this.values.slice(legendSize).join();
      }
    }
    let cmd =
      '?TP_ADDVAR("' +
      name +
      '","' +
      this.varType +
      '","' +
      this.data.selectedRobot +
      '","' +
      value +
      '")';
    if (this.para.useAsProjectPoints) {
      cmd =
        '?TP_ADD_project_points("' +
        name +
        '","' +
        this.varType +
        '","' +
        this.data.selectedRobot +
        '","' +
        value +
        '")';
    }
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        console.log(ret);
      } else {
        let queries = [
          this.data.refreshBases(),
          this.data.refreshTools(),
          this.data.refreshMachineTables(),
          this.data.refreshWorkPieces(),
        ];
        return Promise.all(queries).then(() => {
          this.data.refreshVariables().then(() => {
            this.closeDialog();
            this.snackbar.open(this.words['success'], '', { duration: 2000 });
          });
        });
      }
    });
  }
}
