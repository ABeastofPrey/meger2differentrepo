import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  MatSnackBar,
  MatDialog,
  MatSlideToggleChange,
  MatCheckboxChange,
  MatHorizontalStepper,
} from '@angular/material';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { PalletLevelDesignerComponent } from '../pallet-level-designer/pallet-level-designer.component';
import {
  DataService,
  WebsocketService,
  ApiService,
  MCQueryResponse,
} from '../../../core';
import { PalletLocation, Pallet } from '../../../core/models/pallet.model';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomKeyBoardComponent } from '../../../custom-key-board/custom-key-board.component';

// tslint:disable-next-line: no-any
declare let Isomer: any;

const Point = Isomer.Point;
const Path = Isomer.Path;
const Shape = Isomer.Shape;
const Vector = Isomer.Vector;
const Color = Isomer.Color;
const Canvas = Isomer.Canvas;
const floor = new Color(50, 50, 50);
const servotronixColor = new Color(0, 130, 130);
const servotronixColor2 = new Color(0, 78, 78);
const borderSize = 4;

const kukaColor2 = new Color(229, 156, 96);
const kukaColor = new Color(255, 115, 0);

@Component({
  selector: 'pallet-wizard',
  templateUrl: './pallet-wizard.component.html',
  styleUrls: ['./pallet-wizard.component.scss'],
})
export class PalletWizardComponent implements OnInit {

  private notifier: Subject<boolean> = new Subject();

  @Output() closed = new EventEmitter();

  step1: FormGroup;
  step2: FormGroup;
  step3: FormGroup;
  step4: FormGroup;
  stepCustom1: FormGroup;
  stepCustom2: FormGroup;
  isCurrentRobotCompatible = true;
  lastError: string;
  isPreview1Showing = false;
  originPicName;
  abnormalItemCount = false;

  previewWidth: number;
  previewHeight: number;

  public showStep3KeyboardError: boolean = false;

  @ViewChild('palletPreviewStep1', { static: false }) preview1: ElementRef;
  @ViewChild('palletContainer1', { static: false }) container: ElementRef;
  @ViewChild('designer', { static: false }) designer: PalletLevelDesignerComponent;
  @ViewChild('designer2', { static: false }) designer2: PalletLevelDesignerComponent;
  @ViewChild('stepper', { static: false }) stepper: MatHorizontalStepper;

  @ViewChildren(CustomKeyBoardComponent) customKeyboards: QueryList<CustomKeyBoardComponent>;

  // tslint:disable-next-line: no-any
  private iso: any = null;
  private isPreview1Init = false;
  private words: {};
  private _originResult: string = null;
  private _doubleCheck = false; // TRUE WHEN TRYING TO CROSS-CHECK A FIELD, USED TO PREVENT LOOP CALLS
  private _busy = true;
  private _destroyed = false;

  get busy() {
    return this._busy;
  }

  set busy(val) {
    this._busy = val;
    if (this._destroyed) return;
    if (val) {
      this.step1.disable();
    } else {
      this.step1.enable();
    }
  }

  get originResult() {
    return this._originResult;
  }

  constructor(
    public dataService: DataService,
    private ws: WebsocketService,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private api: ApiService,
    private utils: UtilsService,
    private trn: TranslateService
  ) {
    this.trn
      .get(['dismiss', 'button.save', 'button.discard'])
      .subscribe(words => {
        this.words = words;
      });
  }

  setOriginPic(i: number) {
    switch (i) {
      default:
        break;
      case 0:
        this.originPicName = this.dataService.selectedPallet.type === 'GRID' ? 'origin.png': 'origin-custom.jpg';
        break;
      case 1:
        this.originPicName = this.dataService.selectedPallet.type === 'GRID' ? 'origin.gif': 'origin-custom.jpg';
        break;
      case 2:
        this.originPicName = this.dataService.selectedPallet.type === 'GRID' ? 'origin2.gif': 'x-custom.jpg';
        break;
      case 3:
        this.originPicName = 'xy-custom.jpg';
        break;
    }
  }

  getPreviewSize() {
    if (this.container) {
      this.previewWidth = this.container.nativeElement.offsetWidth * 2;
      this.previewHeight = this.container.nativeElement.offsetWidth * 2;
    }
  }

  private isPalletNew() : Promise<boolean | null> {
    const name = this.dataService.selectedPallet.name;
    return this.ws.query(`?PLT_IS_PALLET_SAVED("${name}")`).then(ret=>{
      if (ret.result === '1') return false;
      if (ret.result === '0') return true;
      return null;
    });
  }

  private async resetPallet() {
    const plt = this.dataService.selectedPallet;
    const name = plt.name;
    plt.reset();
    const promises = [
      this.ws.query('?PLT_GET_PALLETIZING_ORDERS_LIST("' + name + '")')
    ];
    const ret = await Promise.all(promises);
    plt.orderList = ret[0].result.length === 0 ? [] : ret[0].result.split(',');
    this.toggleRetEnable(
      new MatSlideToggleChange(
        null,
        this.dataService.selectedPallet.retEnabled
      ),
      true
    );
    this.toggleAppEnable(
      new MatSlideToggleChange(
        null,
        this.dataService.selectedPallet.appEnabled
      ),
      true
    );
    this.toggleEntryEnable(
      new MatSlideToggleChange(
        null,
        this.dataService.selectedPallet.entryEnabled
      ),
      true
    );
    this.toggleAppExceed(
      { source: null, checked: this.dataService.selectedPallet.appExceed },
      true
    );
    this.toggleRetExceed(
      { source: null, checked: this.dataService.selectedPallet.retExceed },
      true
    );
    if (plt.type === 'CUSTOM') {
      const ret = await this.ws.query('?PLT_GET_CUSTOM_PALLET_DATA_FILE("' + name + '")');
      plt.dataFile = ret.err ? null : ret.result;
    }
  }

  private async getPalletInfo() {
    this.busy = true;
    const name = this.dataService.selectedPallet.name;
    const isNew = await this.isPalletNew();
    if (isNew === null || isNew) {
      await this.resetPallet();
      this.busy = false;
      return;
    }
    this.dataService.selectedPallet.isNew = false;
    const queries = [
      this.ws.query('?PLT_GET_PALLETIZING_ORDERS_LIST("' + name + '")'),
      this.ws.query('?plt_get_number_of_items("' + name + '")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","X")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Y")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Z")'),
      this.dataService.selectedPallet.type === 'CUSTOM' ? null : this.ws.query('?PLT_GET_PALLETIZING_ORDER("' + name + '")'),
      this.ws.query('?PLT_FRAME_CALIBRATION_GET("' + name + '","o")'),
      this.ws.query('?PLT_FRAME_CALIBRATION_GET("' + name + '","x")'),
      this.ws.query('?PLT_FRAME_CALIBRATION_GET("' + name + '","xy")'),
      this.checkCalibrationStatus(),
      this.ws.query(
        '?PLT_IS_ROBOT_TYPE_FIT("' +
          name +
          '",' +
          this.dataService.selectedRobot +
          ')'
      ),
      this.ws.query('PrintPointU "#.##"; PLT_GET_ENTRY_POSITION("' + name + '")'),
      this.ws.query('?PLT_GET_HANDLING_DIRECTION("' + name + '","APPROACH")'),
      this.ws.query('?PLT_GET_HANDLING_DIRECTION("' + name + '","RETRACT")'),
      this.ws.query(
        '?PLT_GET_PALLETIZING_PRE_PLACE("' + name + '","VERTICAL")'
      ),
      this.ws.query(
        '?PLT_GET_PALLETIZING_PRE_PLACE("' + name + '","HORIZONTAL")'
      ),
      this.ws.query(
        '?PLT_GET_PALLETIZING_POST_PLACE("' + name + '","VERTICAL")'
      ),
      this.ws.query(
        '?PLT_GET_PALLETIZING_POST_PLACE("' + name + '","HORIZONTAL")'
      ),
      this.ws.query('?PLT_IS_ENTRY_POSITION_ENABLED("' + name + '")'),
      this.ws.query('?PLT_IS_PRE_PLACE_ENABLED("' + name + '")'),
      this.ws.query('?PLT_IS_POST_PLACE_ENABLED("' + name + '")'),
      this.ws.query('?PLT_GET_INDEX_STATUS("' + name + '")'),
      this.ws.query('?PLT_GET_ALLOW_EXCEED_LIMIT("' + name + '","approach")'),
      this.ws.query('?PLT_GET_ALLOW_EXCEED_LIMIT("' + name + '","retract")'),
      this.ws.query('?PLT_GET_PALLET_SIZE("' + name + '")'),
      this.ws.query('?PLT_GET_CUSTOM_PALLET_DATA_FILE("' + name + '")'),
      this.ws.query('?PLT_GET_NUMBER_OF_LEVELS("' + name + '")'),
      this.ws.query('?PLT_GET_CONFIGURATION_FLAGS("' + name + '")'),
      this.ws.query('?plt_get_status("' + name + '")'),
      this.ws.query('?PLT_GET_LEVELS_LAYOUT_PARITY("' + name + '")')
    ];
    return Promise.all(queries).then((ret: MCQueryResponse[]) => {
      this.dataService.selectedPallet.orderList =
        ret[0].result.length === 0 ? [] : ret[0].result.split(',');
      const itemCount = (ret[1].result.length === 0
        ? '0,0,0'
        : ret[1].result
      ).split(',');
      this.dataService.selectedPallet.itemsX = Number(itemCount[0]);
      this.dataService.selectedPallet.itemsY = Number(itemCount[1]);
      this.dataService.selectedPallet.itemsZ = Number(itemCount[2]);
      this.dataService.selectedPallet.itemSizeX = Number(ret[2].result);
      this.dataService.selectedPallet.itemSizeY = Number(ret[3].result);
      this.dataService.selectedPallet.itemSizeZ = Number(ret[4].result);
      this.dataService.selectedPallet.order = ret[5] ? ret[5].result : null;
      this.dataService.selectedPallet.origin = this.parseLocation(ret[6].result);
      this.dataService.selectedPallet.posX = this.parseLocation(ret[7].result);
      this.dataService.selectedPallet.posY = this.parseLocation(ret[8].result);
      this.isCurrentRobotCompatible = ret[10].result === '1';
      this.dataService.selectedPallet.entry = this.parseLocation(
        ret[11].result
      );
      this.dataService.selectedPallet.approachDirection = ret[12].result;
      this.dataService.selectedPallet.retractDirection = ret[13].result;
      this.dataService.selectedPallet.approachOffsetVertical = Number(ret[14].result);
      this.dataService.selectedPallet.approachOffsetHorizontal = Number(ret[15].result);
      this.dataService.selectedPallet.retractOffsetVertical = Number(ret[16].result);
      this.dataService.selectedPallet.retractOffsetHorizontal = Number(ret[17].result);
      this.dataService.selectedPallet.entryEnabled = ret[18].result === '1';
      this.dataService.selectedPallet.appEnabled = ret[19].result === '1';
      this.dataService.selectedPallet.retEnabled = ret[20].result === '1';
      const n = Number(ret[21].result);
      this.dataService.selectedPallet.index = n || 0;
      if (n || ret[28].result === 'EMPTY') {
        let indexType: string = null;
        switch(ret[28].result) {
          case 'EMPTY':
            indexType = 'empty';
            break;
          case 'FULL':
            indexType = this.dataService.selectedPallet.type === 'GRID' ? 'full' : 'custom';
            break;
          default:
            indexType = 'custom';
        }
        this.step1.controls['index'].setValue(indexType);
        this.step1.controls['index'].markAsDirty();
        this.onWindowResize();
      }
      this.dataService.selectedPallet.appExceed = ret[22].result === '1';
      this.dataService.selectedPallet.retExceed = ret[23].result === '1';
      const palletSizes = (ret[24].result.length === 0
        ? '0,0,0'
        : ret[24].result
      ).split(',');
      this.dataService.selectedPallet.palletSizeX = Number(palletSizes[0]);
      this.dataService.selectedPallet.palletSizeY = Number(palletSizes[1]);
      this.toggleRetEnable(
        new MatSlideToggleChange(
          null,
          this.dataService.selectedPallet.retEnabled
        ),
        true
      );
      this.toggleAppEnable(
        new MatSlideToggleChange(
          null,
          this.dataService.selectedPallet.appEnabled
        ),
        true
      );
      this.toggleEntryEnable(
        new MatSlideToggleChange(
          null,
          this.dataService.selectedPallet.entryEnabled
        ),
        true
      );
      this.toggleAppExceed(
        { source: null, checked: this.dataService.selectedPallet.appExceed },
        true
      );
      this.toggleRetExceed(
        { source: null, checked: this.dataService.selectedPallet.retExceed },
        true
      );
      this.dataService.selectedPallet.dataFile = ret[25].err
        ? null
        : ret[25].result;
      this.dataService.selectedPallet.levels = Number(ret[26].result) || 0;
      const flags = ret[27].result.split(',');

      // SET ODD EVEN
      this.dataService.selectedPallet.diffOddEven = ret[29].result === '1';

      this.dataService.selectedPallet.flags = flags.map(val => {
        return Number(val);
      });
      if (
        this.dataService.selectedPallet.flags.some(f => {
          return isNaN(f);
        })
      ) {
        return Promise.all(
          flags.map(f => {
            return this.ws.query('?' + f);
          })
        ).then((ret: MCQueryResponse[]) => {
          this.dataService.selectedPallet.flags = ret.map(r => {
            return Number(r.result);
          });
        });
      }
    }).then(()=>{
        this.initFormControl()
        this.busy = false;
    });
  }

  private parseLocation(loc: string): PalletLocation {
    const result = new PalletLocation();
    if (loc === '#{}' || loc === '#{ ;}') return result;
    loc = loc
      .substring(2)
      .slice(0, -1)
      .trim();
    const parts = loc.split(';');
    const pos = parts[0].split(',');
    const flags = parts[1] ? parts[1].split(',') : [];
    result.x = Number(pos[0]);
    result.y = Number(pos[1]);
    result.z = Number(pos[2]);
    if (this.dataService.robotType === 'SCARA') {
      result.roll = Number(pos[3]);
    } else {
      result.yaw = Number(pos[3]);
      result.pitch = Number(pos[4]);
      result.roll = Number(pos[5]);
    }
    return result;
  }

  /*
   * Takes a pallet location and converts it into a user-readable string
   */
  locToString(loc: PalletLocation): string {
    let result = '#{' + loc.x + ',' + loc.y + ',' + loc.z + ',';
    if (this.dataService.robotType === 'SCARA') {
      result += loc.roll;
    } else {
      result += loc.yaw + ',' + loc.pitch + ',' + loc.roll;
    }
    result += '}';
    return result;
  }

  calibrate(e: Event) {
    // if(this.step2.invalid) {
    //   this.dataService.selectedPallet.isFrameCalibrated = true;
    //   return ;
    // }
    const p = this.dataService.selectedPallet;
    this.ws.query('?PLT_ORIGIN_CALIBRATION("' + p.name + '")').then(ret => {
      if (ret.result === '0') {
        p.isFrameCalibrated = true;
        this.ws.query('?PLT_GET_ORIGIN("' + p.name + '")').then(ret => {
          this._originResult = ret.result;
        });
      } else {
        this.dataService.selectedPallet.isFrameCalibrated = false;
      }
    });
  }

  private checkCalibrationStatus() {
    const pal = this.dataService.selectedPallet.name;
    return this.ws.query('?PLT_IS_ORIGIN_CALIBRATED("' + pal + '")')
      .then((ret: MCQueryResponse) => {
        this.dataService.selectedPallet.isFrameCalibrated = ret.result === '1';
        if (!this.dataService.selectedPallet.isFrameCalibrated) {
          return { notCalibrated: true };
        }
        return this.ws.query('?PLT_GET_ORIGIN("' + pal + '")')
          .then((ret: MCQueryResponse) => {
            this._originResult = ret.result;
            return null;
          });
      });
  }

  teachOrigin() {
    const pallet = this.dataService.selectedPallet;
    const robot = this.dataService.selectedRobot;
    this.ws.query('?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","o",' + robot + ')').then(ret => {
        if (ret.result === '0') {
          this.ws.query('PrintPointU "#.##"; PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","o")').then(ret => {
            this.dataService.selectedPallet.origin = this.parseLocation(ret.result);
            this.step2Origin(this.dataService.selectedPallet);
          });
        }
      });
  }

  teachPosX() {
    const pallet = this.dataService.selectedPallet;
    const robot = this.dataService.selectedRobot;
    this.ws
      .query(
        '?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","x",' + robot + ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('PrintPointU "#.##"; PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","x")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.posX = this.parseLocation(
                ret.result
              );
              this.step2posX(this.dataService.selectedPallet);
            });
        }
      });
  }

  teachPosY() {
    const pallet = this.dataService.selectedPallet;
    const robot = this.dataService.selectedRobot;
    this.ws
      .query(
        '?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","xy",' + robot + ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('PrintPointU "#.##"; PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","xy")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.posY = this.parseLocation(
                ret.result
              );
              this.step2posY(this.dataService.selectedPallet);
            });
        }
      });
  }

  teachEntry() {
    const pallet = this.dataService.selectedPallet;
    const robot = this.dataService.selectedRobot;
    this.ws
      .query('?PLT_TEACH_ENTRY_POSITION("' + pallet.name + '",' + robot + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws.query('PrintPointU "#.##"; PLT_GET_ENTRY_POSITION("' + pallet.name + '")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.entry = this.parseLocation(
                ret.result
              );
              this.step3Entry(this.dataService.selectedPallet);
            });
          this.ws.query('?PLT_GET_CONFIGURATION_FLAGS("' +  pallet.name + '")').then(ret=>{
            const flags = ret.result.split(',');
            this.dataService.selectedPallet.flags = flags.map(val => {
              return Number(val);
            });
            if (
              this.dataService.selectedPallet.flags.some(f => {
                return isNaN(f);
              })
            ) {
              return Promise.all(
                flags.map(f => {
                  return this.ws.query('?' + f);
                })
              ).then((ret: MCQueryResponse[]) => {
                this.dataService.selectedPallet.flags = ret.map(r => {
                  return Number(r.result);
                });
              });
            }
          });
        }
      });
  }

  onIndexChange() {
    this.step1.controls['index'].markAsTouched();
    this.step1.controls['index'].markAsDirty();
    this.step1.controls['index'].setValue(this.step1.controls['index'].value);
  }

  private validateIndex(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!control.touched && !control.dirty && typeof control.value !== 'undefined') {
      return Promise.resolve(null);
    }
    if (typeof control.value === 'undefined') {
      return Promise.resolve({invalidIndex: true});
    }
    let cmd;
    switch (control.value) {
      case 'full':
        cmd = 'PLT_SET_INDEX_STATUS_FULL("' + pallet.name + '")';
        break;
      case 'empty':
        cmd = 'PLT_SET_INDEX_STATUS_EMPTY("' + pallet.name + '")';
        break;
      case 'custom':
        cmd =
          'PLT_SET_INDEX_STATUS("' + pallet.name + '",' + pallet.index + ')';
        break;
      default:
        // NO PALLET INDEX MODE SELECTED
        if (pallet.type === 'CUSTOM' && pallet.dataFile === null) {
          this.setErrorsKeyboard(['index'],null);
          return Promise.resolve(null);
        }

        this.setErrorsKeyboard(['index'],{ invalidIndex: true });
        return Promise.resolve({ invalidIndex: true });
    }
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return this.ws
        .query('?PLT_GET_INDEX_STATUS("' + pallet.name + '")')
        .then((ret: MCQueryResponse) => {
          this.dataService.selectedPallet.index = Number(ret.result);
          this.onWindowResize();
          this.setErrorsKeyboard(['index'],null);
          return null;
        });
    });
  }

  private getItemsXYZ(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxZ = Math.ceil(count / (pallet.itemsX * pallet.itemsY)) - 1;
    for (let z = 0; z <= maxZ; z++) {
      const countForThisLevel = count;
      const maxY =
        z < maxZ
          ? pallet.itemsY - 1
          : Math.floor((countForThisLevel - 1) / pallet.itemsX);
      for (let i = pallet.itemsX - 1; i >= 0; i--) {
        for (let j = maxY; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          if (z < maxZ || pallet.itemsX * j + i < countForThisLevel) {
            // FULL FLOOR...
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getItemsYXZ(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxZ = Math.ceil(count / (pallet.itemsX * pallet.itemsY)) - 1;
    for (let z = 0; z <= maxZ; z++) {
      const countForThisLevel = count;
      const maxX =
        z < maxZ
          ? pallet.itemsX - 1
          : Math.floor((countForThisLevel - 1) / pallet.itemsY);
      for (let i = maxX; i >= 0; i--) {
        for (let j = pallet.itemsY - 1; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          if (z < maxZ || pallet.itemsY * i + j < countForThisLevel) {
            // FULL FLOOR...
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getItemsXZY(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxY = Math.ceil(count / (pallet.itemsZ * pallet.itemsX)) - 1;
    for (let z = 0; z < pallet.itemsZ; z++) {
      for (let i = pallet.itemsX - 1; i >= 0; i--) {
        for (let j = maxY; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          const itemsSoFar =
            j * pallet.itemsZ * pallet.itemsX + z * pallet.itemsX + i + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getItemsYZX(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxX = Math.ceil(count / (pallet.itemsZ * pallet.itemsY)) - 1;
    for (let z = 0; z < pallet.itemsZ; z++) {
      for (let i = maxX; i >= 0; i--) {
        for (let j = pallet.itemsY - 1; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          const itemsSoFar =
            i * pallet.itemsZ * pallet.itemsY + z * pallet.itemsY + j + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getItemsZYX(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxX = Math.ceil(count / (pallet.itemsZ * pallet.itemsY)) - 1;
    for (let z = 0; z < pallet.itemsZ; z++) {
      for (let i = maxX; i >= 0; i--) {
        for (let j = pallet.itemsY - 1; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          const itemsSoFar =
            i * pallet.itemsZ * pallet.itemsY + j * pallet.itemsZ + z + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getItemsZXY(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.dataService.selectedPallet;
    let count = pallet.index;
    const maxY = Math.ceil(count / (pallet.itemsZ * pallet.itemsX)) - 1;
    for (let z = 0; z < pallet.itemsZ; z++) {
      for (let i = pallet.itemsX - 1; i >= 0; i--) {
        for (let j = maxY; j >= 0; j--) {
          const x = i * itemX;
          const y = j * itemY;
          const itemsSoFar =
            j * pallet.itemsZ * pallet.itemsX + i * pallet.itemsZ + z + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getPalletDrawingData() {
    const result = {
      floor: null,
      items: [],
    };
    const pallet = this.dataService.selectedPallet;
    if (typeof pallet.index === 'undefined') return result;
    if (pallet.itemsY * pallet.itemsX * pallet.itemsZ > 250 || pallet.itemSizeX >= 10000 || pallet.itemSizeY >= 10000 || pallet.itemSizeZ >= 10000) {
      this.abnormalItemCount = true;
      return result;
    }
    this.abnormalItemCount = false;
    if (
      pallet.itemsX > 0 &&
      pallet.itemsY > 0 &&
      pallet.itemsZ > 0 &&
      pallet.itemSizeX > 0 &&
      pallet.itemSizeY > 0 &&
      pallet.itemSizeZ > 0
    ) {
      const x = pallet.itemsX * pallet.itemSizeX;
      const y = pallet.itemsY * pallet.itemSizeY;
      const sizeByX = x > y;
      const mm = sizeByX ? 4 / x : 4 / y; // 1 millimeter
      const itemX = pallet.itemSizeX * mm;
      const itemY = pallet.itemSizeY * mm;
      const itemZ = pallet.itemSizeZ * mm;
      result.floor = sizeByX
        ? Shape.Prism(Point(0, 0, 0), 4, (4 * y) / x, 0.4)
        : Shape.Prism(Point(0, 0, 0), (4 * x) / y, 4, 0.4);
      switch (pallet.order) {
        default:
          break;
        case 'XYZ':
          result.items = this.getItemsXYZ(itemX, itemY, itemZ);
          break;
        case 'YXZ':
          result.items = this.getItemsYXZ(itemX, itemY, itemZ);
          break;
        case 'XZY':
          result.items = this.getItemsXZY(itemX, itemY, itemZ);
          break;
        case 'YZX':
          result.items = this.getItemsYZX(itemX, itemY, itemZ);
          break;
        case 'ZYX':
          result.items = this.getItemsZYX(itemX, itemY, itemZ);
          break;
        case 'ZXY':
          result.items = this.getItemsZXY(itemX, itemY, itemZ);
          break;
      }
    }
    return result;
  }

  private validateOrder(control: AbstractControl) {
    if (this.dataService.selectedPallet.type === 'CUSTOM' || (!control.touched && !control.dirty)) {
      return Promise.resolve(null);
    }
    const cmd =
      '?PLT_SET_PALLETIZING_ORDER("' +
      this.dataService.selectedPallet.name +
      '","' +
      control.value +
      '")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidOrder: true } : null;
    });
  }

  private validateLevel(i: number, control: AbstractControl) {
    if (this.dataService.selectedPallet.type === 'GRID') {
      return Promise.resolve(null);
    }
    let data = null;
    let invalid = false;
    if (this.designer && this.designer.initDone) {
      data = this.designer.getDataAsString();
      if (data.length === 0 || this.designer.items.find(i=>i.error === true)) {
        invalid = true;
      }
      if (this.designer2 && this.designer2.initDone) {
        const data2 = this.designer2.getDataAsString();
        if (i === 2 && (data2.length === 0 || this.designer2.items.find(i=>i.error === true))) {
          invalid = true;
        }
        data = data + '---\n' + data2;
      } else if (this.dataService.selectedPallet.diffOddEven) {
        setTimeout(()=>{
          this.onLevelChange(2, this.designer2.items.length);
        },200);
        return Promise.resolve({ invalidDataFile: [] });
      }
      const file = this.dataService.selectedPallet.dataFile;
      return this.api.createPalletFile(data, file).then(fileName => {
        const success = fileName.length > 0;
        if (!success || invalid) {
          return { invalidDataFile: [] };
        }
        // validate level with library
        const cmd = `?PLT_VALIDATE_CUSTOM_LEVEL("${this.dataService.selectedPallet.name}",${i})`;
        return this.ws.query(cmd).then(result=>{
          return result.result === '' ? null : {invalidDataFile: result.result.split(',').filter(a=>a.length>0)};
        });
      },
      () => {
        return { invalidDataFile: [] };
      });
    }
    return Promise.resolve(null);
  }

  private validateLevels(control: AbstractControl) {
    if (this.dataService.selectedPallet.type === 'GRID' ||(!control.touched && !control.dirty)) {
      return Promise.resolve(null);
    }
    const pallet = this.dataService.selectedPallet.name;
    const cmd =
      '?PLT_SET_NUMBER_OF_LEVELS("' + pallet + '",' + control.value + ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidLevelCount: true };
      }
      if (this.dataService.selectedPallet.entryEnabled) {
        this.step3.controls['x'].markAsDirty();
        this.step3.controls['x'].updateValueAndValidity();
      }
      return null;
    });
  }

  private validateDiffOdd(control: AbstractControl) {
    if (this.dataService.selectedPallet.type === 'GRID' || (!control.touched && !control.dirty)) {
      return Promise.resolve(null);
    }
    const pallet = this.dataService.selectedPallet.name;
    const cmd = '?PLT_SET_LEVELS_LAYOUT_PARITY("' + pallet + '",' + (control.value ? 1 : 0) + ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidOddDiff: true } : null;
    });
  }

  private validateItems(changed: string, control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (pallet.type === 'CUSTOM') {
      this.step1.controls['itemsX'].setErrors(null);
      this.step1.controls['itemsY'].setErrors(null);
      this.step1.controls['itemsZ'].setErrors(null);
      this.setErrorsKeyboard(['itemsX','itemsY','itemsZ'],null);
      return Promise.resolve(null);
    }
    if (!control.touched && !control.dirty) {
      return Promise.resolve(null);
    }
    const x = changed === 'x' ? control.value : pallet.itemsX;
    const y = changed === 'y' ? control.value : pallet.itemsY;
    const z = changed === 'z' ? control.value : pallet.itemsZ;
    if (x && y && z) {
      const cmd = `?PLT_SET_NUMBER_OF_ITEMS("${pallet.name}",${x},${y},${z})`;
      const cmdRestore = `?PLT_GET_NUMBER_OF_ITEMS("${pallet.name}")`;
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        this.onIndexChange();
        if (ret.err || ret.result !== '0') {
          this.step1.controls['itemsX'].setErrors({ invalidItemCount: true });
          this.step1.controls['itemsY'].setErrors({ invalidItemCount: true });
          this.step1.controls['itemsZ'].setErrors({ invalidItemCount: true });
          this.setErrorsKeyboard(['itemsX','itemsY','itemsZ'],{ invalidItemCount: true });
          this.ws.query(cmdRestore).then(ret=>{
            const itemCount = (ret.result.length === 0 ? '0,0,0' : ret.result).split(',');
            this.dataService.selectedPallet.itemsX = Number(itemCount[0]);
            this.dataService.selectedPallet.itemsY = Number(itemCount[1]);
            this.dataService.selectedPallet.itemsZ = Number(itemCount[2]);
          });
          return { invalidItemCount: true };
        }
        if (pallet.entryEnabled) {
          this.step3.controls['x'].markAsDirty();
          this.step3.controls['x'].updateValueAndValidity();
        }
        this.step1.controls['itemsX'].setErrors(null);
        this.step1.controls['itemsY'].setErrors(null);
        this.step1.controls['itemsZ'].setErrors(null);
        this.setErrorsKeyboard(['itemsX','itemsY','itemsZ'],null);
        return Promise.resolve(null);
      });
    }
    this.step1.controls['itemsX'].setErrors(null);
    this.step1.controls['itemsY'].setErrors(null);
    this.step1.controls['itemsZ'].setErrors(null);
    this.setErrorsKeyboard(['itemsX','itemsY','itemsZ'],null);
    return Promise.resolve(null);
  }

  private validateItemSizeX(control: AbstractControl) {
    if (!control.touched && !control.dirty) return Promise.resolve(null);
    const pallet = this.dataService.selectedPallet;
    const cmd = '?PLT_SET_ITEM_DIMENSION("' + pallet.name + '","X",' + control.value + ')';
    const cmdRestore = '?PLT_GET_ITEM_DIMENSION("' + pallet.name + '","X")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        this.ws.query(cmdRestore).then(ret=>{
          pallet.itemSizeX = Number(ret.result);
        });
        return { invalidSizeX: true };
      }
      return null;
    });
  }

  private validateItemSizeY(control: AbstractControl) {
    if (!control.touched && !control.dirty) return Promise.resolve(null);
    const pallet = this.dataService.selectedPallet;
    const cmd = '?PLT_SET_ITEM_DIMENSION("' + pallet.name + '","Y",' + control.value + ')';
    const cmdRestore = '?PLT_GET_ITEM_DIMENSION("' + pallet.name + '","Y")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        this.ws.query(cmdRestore).then(ret=>{
          pallet.itemSizeY = Number(ret.result);
        });
        return { invalidSizeY: true };
      }
      return null;
    });
  }

  private validateItemSizeZ(control: AbstractControl) {
    if (!control.touched && !control.dirty) return Promise.resolve(null);
    const pallet = this.dataService.selectedPallet;
    const cmd = '?PLT_SET_ITEM_DIMENSION("' + pallet.name + '","Z",' + control.value + ')';
    const cmdRestore = '?PLT_GET_ITEM_DIMENSION("' + pallet.name + '","Z")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        this.ws.query(cmdRestore).then(ret=>{
          pallet.itemSizeZ = Number(ret.result);
        });
        return { invalidSizeZ: true };
      }
      if (pallet.entryEnabled) {
        this.step3.controls['x'].markAsDirty();
        this.step3.controls['x'].updateValueAndValidity();
      }
      return null;
    });
  }

  private validatePalletSize(changed: string, control: AbstractControl) {
    const pallet = this.dataService.selectedPallet.name;
    const x =
      changed === 'x'
        ? control.value
        : this.dataService.selectedPallet.palletSizeX;
    const y =
      changed === 'y'
        ? control.value
        : this.dataService.selectedPallet.palletSizeY;
    if (x && y) {
      if (!control.touched && !control.dirty) return Promise.resolve(null);
      const cmd = '?PLT_SET_PALLET_SIZE("' + pallet + '",' + x + ',' + y + ',0)';
      const cmdRestore = '?PLT_GET_PALLET_SIZE("' + pallet + '")';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step1.controls['palletSizeX'].setErrors({ invalidSize: true });
          this.step1.controls['palletSizeY'].setErrors({ invalidSize: true });
          this.setErrorsKeyboard(['palletSizeX','palletSizeY'],{ invalidSize: true });
          this.ws.query(cmdRestore).then(ret=>{
            const palletSizes = (ret.result.length === 0 ? '0,0' : ret.result).split(',');
            this.dataService.selectedPallet.palletSizeX = Number(palletSizes[0]);
            this.dataService.selectedPallet.palletSizeY = Number(palletSizes[1]);
          });
          return { invalidSize: true };
        }
        this.step1.controls['palletSizeX'].setErrors(null);
        this.step1.controls['palletSizeY'].setErrors(null);
        this.setErrorsKeyboard(['palletSizeX','palletSizeY'],null);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validateOrigin(changed: string, control: AbstractControl) {
    const origin = this.dataService.selectedPallet.origin;
    const x = changed === 'x' ? control.value : origin.x;
    const y = changed === 'y' ? control.value : origin.y;
    const z = changed === 'z' ? control.value : origin.z;
    if (
      x !== null && y !== null && z !== null &&
      typeof x !== 'undefined' && typeof y !== 'undefined' && typeof z !== 'undefined' &&
      !isNaN(Number(x)) && !isNaN(Number(y)) && !isNaN(Number(z))
    ) {
      if (!control.touched && !control.dirty) return Promise.resolve(null);
      const cmd =
        '?PLT_FRAME_CALIBRATION_SET("' +
        this.dataService.selectedPallet.name +
        '","o",' +
        x +
        ',' +
        y +
        ',' +
        z +
        ',0,0,0)';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['originX'].setErrors({ invalidOrigin: true });
          this.step2.controls['originY'].setErrors({ invalidOrigin: true });
          this.step2.controls['originZ'].setErrors({ invalidOrigin: true });
          this.setErrorsKeyboard(['originX','originY','originZ'],{ invalidOrigin: true });
          return { invalidOrigin: true };
        }
        if (this.dataService.selectedPallet.entryEnabled) {
          this.step3.controls['x'].markAsDirty();
          this.step3.controls['x'].updateValueAndValidity();
        }
        this.step2.controls['originX'].setErrors(null);
        this.step2.controls['originY'].setErrors(null);
        this.step2.controls['originZ'].setErrors(null);
        this.setErrorsKeyboard(['originX','originY','originZ'],null);
        this.step2.controls['calibrated'].setValue(false);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validatePosX(changed: string, control: AbstractControl) {
    const pos = this.dataService.selectedPallet.posX;
    const x = changed === 'x' ? control.value : pos.x;
    const y = changed === 'y' ? control.value : pos.y;
    const z = changed === 'z' ? control.value : pos.z;
    if (
      x !== null && y !== null && z !== null &&
      typeof x !== 'undefined' && typeof y !== 'undefined' && typeof z !== 'undefined' &&
      !isNaN(Number(x)) && !isNaN(Number(y)) && !isNaN(Number(z))
    ) {
      if (!control.touched && !control.dirty) return Promise.resolve(null);
      const cmd =
        '?PLT_FRAME_CALIBRATION_SET("' +
        this.dataService.selectedPallet.name +
        '","x",' +
        x +
        ',' +
        y +
        ',' +
        z +
        ',0,0,0' +
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['posXX'].setErrors({ invalidPosX: true });
          this.step2.controls['posXY'].setErrors({ invalidPosX: true });
          this.step2.controls['posXZ'].setErrors({ invalidPosX: true });
          this.setErrorsKeyboard(['posXX','posXY','posXZ'],{ invalidPosX: true });
          return { invalidOrigin: true };
        }
        this.step2.controls['posXX'].setErrors(null);
        this.step2.controls['posXY'].setErrors(null);
        this.step2.controls['posXZ'].setErrors(null);
        this.setErrorsKeyboard(['posXX','posXY','posXZ'],null);
        this.step2.controls['calibrated'].setValue(false);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validatePosY(changed: string, control: AbstractControl) {
    const pos = this.dataService.selectedPallet.posY;
    const x = changed === 'x' ? control.value : pos.x;
    const y = changed === 'y' ? control.value : pos.y;
    const z = changed === 'z' ? control.value : pos.z;
    if (x !== null && y !== null && z !== null) {
      if (!control.touched && !control.dirty) return Promise.resolve(null);
      const cmd =
        '?PLT_FRAME_CALIBRATION_SET("' +
        this.dataService.selectedPallet.name +
        '","xy",' +
        x +
        ',' +
        y +
        ',' +
        z +
        ',0,0,0' +
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['posYX'].setErrors({ invalidPosY: true });
          this.step2.controls['posYY'].setErrors({ invalidPosY: true });
          this.step2.controls['posYZ'].setErrors({ invalidPosY: true });
          this.setErrorsKeyboard(['posYX','posYY','posYZ'],{ invalidPosY: true });
          return { invalidOrigin: true };
        }
        this.step2.controls['posYX'].setErrors(null);
        this.step2.controls['posYY'].setErrors(null);
        this.step2.controls['posYZ'].setErrors(null);
        this.step2.controls['calibrated'].setValue(false);
        this.setErrorsKeyboard(['posYX','posYY','posYZ'],null);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validateFlag(flag: number, control: AbstractControl) {
    if (!control.touched && !control.dirty) return Promise.resolve(null);
    const pal = this.dataService.selectedPallet;
    // if every flag is NaN or one flag is AUTO - this is wrong
    const newVal = control.value;
    if (newVal === 0 || pal.flags.every(f => isNaN(f))) {
      this.step3.controls['flag' + flag].setErrors({ invalidFlag: true });
      this.setErrorsKeyboard(['flag' + flag],{ invalidFlag: true });
      return Promise.resolve({ invalidFlag: true });
    }
    pal.flags[flag] = newVal;
    const flags = pal.flags.map(f=>f === -1 ? 0 : f).join(',');
    const cmd = '?PLT_SET_CONFIGURATION_FLAGS("' + pal.name + '",' + flags + ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        this.step3.controls['flag' + flag].setErrors({ invalidFlag: true });
        this.setErrorsKeyboard(['flag' + flag],{ invalidFlag: true });
        return { invalidFlag: true };
      }
      this.step3.controls['flag' + flag].setErrors(null);
      this.setErrorsKeyboard(['flag' + flag],null);
      if (pal.entryEnabled) {
        this.step3.controls['x'].markAsDirty();
        this.step3.controls['x'].updateValueAndValidity();
      }
      return Promise.resolve(null);
    });
  }

  private validateEntry(changed: string, control: AbstractControl) {
    if (!control.touched && !control.dirty) {
      this.step3.controls['x'].setErrors(null);
      this.step3.controls['y'].setErrors(null);
      this.step3.controls['z'].setErrors(null);
      this.step3.controls['yaw'].setErrors(null);
      this.step3.controls['pitch'].setErrors(null);
      this.step3.controls['roll'].setErrors(null);
      this.setErrorsKeyboard(['x','y','z','yaw','pitch','roll'],null);
      return Promise.resolve(null);
    }
    const pos = this.dataService.selectedPallet.entry;
    const x = changed === 'x' ? control.value : pos.x;
    const y = changed === 'y' ? control.value : pos.y;
    const z = changed === 'z' ? control.value : pos.z;
    const yaw = changed === 'yaw' ? control.value : pos.yaw;
    const pitch = changed === 'pitch' ? control.value : pos.pitch;
    const roll = changed === 'roll' ? control.value : pos.roll;
    if (x !== null && y !== null && z !== null && roll !== null) {
      let loc = 'castpoint(#{' + x + ',' + y + ',' + z + ',';
      if (this.dataService.robotType === 'PUMA') {
        if (yaw !== null && pitch !== null){
          loc += yaw + ',' + pitch + ',';
        } else {
          this.setErrorsKeyboard([changed],null);
          return Promise.resolve(null);
        }
      }
      loc +=
        roll +
        ';0,0,0},' +
        'robottype(' +
        this.dataService.selectedRobot +
        '.Here))';
      const cmd = '?PLT_SET_ENTRY_POSITION("' + this.dataService.selectedPallet.name + '",' + loc + ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step3.controls['x'].setErrors({ invalidEntry: true });
          this.step3.controls['y'].setErrors({ invalidEntry: true });
          this.step3.controls['z'].setErrors({ invalidEntry: true });
          this.step3.controls['yaw'].setErrors({ invalidEntry: true });
          this.step3.controls['pitch'].setErrors({ invalidEntry: true });
          this.step3.controls['roll'].setErrors({ invalidEntry: true });
          this.setErrorsKeyboard(['x','y','z','yaw','pitch','roll'],{ invalidEntry: true });
          // this.showStep3KeyboardError = true;
          return { invalidEntry: true };
        }
        this.step3.controls['x'].setErrors(null);
        this.step3.controls['y'].setErrors(null);
        this.step3.controls['z'].setErrors(null);
        this.step3.controls['yaw'].setErrors(null);
        this.step3.controls['pitch'].setErrors(null);
        this.step3.controls['roll'].setErrors(null);
        this.setErrorsKeyboard(['x','y','z','yaw','pitch','roll'],null);
        // this.showStep3KeyboardError = false;
        return Promise.resolve(null);
      });
    }
    // this.showStep3KeyboardError = false;
    return Promise.resolve(null);
  }

  private validateAppOffsetV(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    const off = control.value;
    const cmd =
      '?PLT_SET_PALLETIZING_PRE_PLACE("' +
      pallet.name +
      '","VERTICAL",' +
      off +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidAppOffsetV: true };
      }
      return Promise.resolve(null);
    });
  }

  private validateAppOffsetH(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    const off = control.value;
    const cmd =
      '?PLT_SET_PALLETIZING_PRE_PLACE("' +
      pallet.name +
      '","HORIZONTAL",' +
      off +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidAppOffsetH: true };
      }
      return Promise.resolve(null);
    });
  }

  private validateAppDir(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    const dir = control.value;
    const cmd =
      '?PLT_SET_HANDLING_DIRECTION("' +
      pallet.name +
      '","APPROACH","' +
      dir +
      '")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidAppDir: true };
      }
      return Promise.resolve(null);
    });
  }

  private validateRetOffsetV(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    const off = control.value;
    const cmd =
      '?PLT_SET_PALLETIZING_POST_PLACE("' +
      pallet.name +
      '","VERTICAL",' +
      off +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidRetOffsetV: true };
      }
      return Promise.resolve(null);
    });
  }

  private validateRetOffsetH(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    const off = control.value;
    const cmd =
      '?PLT_SET_PALLETIZING_POST_PLACE("' +
      pallet.name +
      '","HORIZONTAL",' +
      off +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidRetOffsetH: true };
      }
      return Promise.resolve(null);
    });
  }

  private validateRetDir(control: AbstractControl) {
    const pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    const dir = control.value;
    const cmd =
      '?PLT_SET_HANDLING_DIRECTION("' +
      pallet.name +
      '","RETRACT","' +
      dir +
      '")';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.err || ret.result !== '0') {
        return { invalidRetDir: true };
      }
      return Promise.resolve(null);
    });
  }

  finish() {
    const name = this.dataService.selectedPallet.name;
    this.ws
      .query('?PLT_ENABLE_PALLET("' + name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.closeDialog(false);
        }
      });
  }

  ngOnInit() {
    this.initControls();
    this.setOriginPic(0);
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
    this._destroyed = true;
  }

  private initControls() {
    const pallet = this.dataService.selectedPallet;
    this.step1 = this._formBuilder.group({
      order:
        pallet.type === 'CUSTOM'
          ? ['']
          : ['', [Validators.required], this.validateOrder.bind(this)],
      itemsX:
        pallet.type === 'CUSTOM'
          ? ['']
          : [
              '',
              [Validators.required, Validators.min(1), Validators.max(1000)],
              this.validateItems.bind(this, 'x'),
            ],
      itemsY:
        pallet.type === 'CUSTOM'
          ? ['']
          : [
              '',
              [Validators.required, Validators.min(1), Validators.max(1000)],
              this.validateItems.bind(this, 'y'),
            ],
      itemsZ:
        pallet.type === 'CUSTOM'
          ? ['']
          : [
              '',
              [Validators.required, Validators.min(1), Validators.max(1000)],
              this.validateItems.bind(this, 'z'),
            ],
      itemSizeX: [
        '',
        [Validators.required, Validators.min(1)],
        this.validateItemSizeX.bind(this),
      ],
      itemSizeY: [
        '',
        [Validators.required, Validators.min(1)],
        this.validateItemSizeY.bind(this),
      ],
      itemSizeZ: [
        '',
        [Validators.required, Validators.min(1)],
        this.validateItemSizeZ.bind(this),
      ],
      palletSizeX: [
        '',
        [Validators.required, Validators.min(1)],
        this.validatePalletSize.bind(this, 'x'),
      ],
      palletSizeY: [
        '',
        [Validators.required, Validators.min(1)],
        this.validatePalletSize.bind(this, 'y'),
      ],
      index: [null, [Validators.required], this.validateIndex.bind(this)],
      levels:
        pallet.type === 'GRID'
          ? ['']
          : [
              '',
              [Validators.required, Validators.min(1)],
              this.validateLevels.bind(this),
            ],
      diffOddEven: pallet.type === 'GRID' ? [''] : ['',[],this.validateDiffOdd.bind(this)],
    }, {
      updateOn: 'blur'
    });
    // listen to pallet and item change events
    this.step1.get('itemSizeX').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemSizeX');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemsX').updateValueAndValidity();
      this.step1.get('palletSizeX').updateValueAndValidity();
      if (pallet.type === 'CUSTOM') {
        this.stepCustom1.get('levelExists').updateValueAndValidity();
        if (pallet.diffOddEven) {
          this.stepCustom2.get('levelExists').updateValueAndValidity();
        }
      }
      this._doubleCheck = false;
    });
    this.step1.get('itemsX').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemsX');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemSizeX').updateValueAndValidity();
      this.step1.get('palletSizeX').updateValueAndValidity();
      this._doubleCheck = false;
    });
    this.step1.get('palletSizeX').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('palletSizeX');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemSizeX').updateValueAndValidity();
      this.step1.get('itemsX').updateValueAndValidity();
      if (pallet.type === 'CUSTOM') {
        this.stepCustom1.get('levelExists').updateValueAndValidity();
        if (pallet.diffOddEven) {
          this.stepCustom2.get('levelExists').updateValueAndValidity();
        }
      }
      this._doubleCheck = false;
    });

    this.step1.get('itemSizeY').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemSizeY');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemsY').updateValueAndValidity();
      this.step1.get('palletSizeY').updateValueAndValidity();
      if (pallet.type === 'CUSTOM') {
        this.stepCustom1.get('levelExists').updateValueAndValidity();
        if (pallet.diffOddEven) {
          this.stepCustom2.get('levelExists').updateValueAndValidity();
        }
      }
      this._doubleCheck = false;
    });
    this.step1.get('itemsY').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemsY');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemSizeY').updateValueAndValidity();
      this.step1.get('palletSizeY').updateValueAndValidity();
      this._doubleCheck = false;
    });
    this.step1.get('palletSizeY').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('palletSizeY');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemSizeY').updateValueAndValidity();
      this.step1.get('itemsY').updateValueAndValidity();
      if (pallet.type === 'CUSTOM') {
        this.stepCustom1.get('levelExists').updateValueAndValidity();
        if (pallet.diffOddEven) {
          this.stepCustom2.get('levelExists').updateValueAndValidity();
        }
      }
      this._doubleCheck = false;
    });

    this.step1.get('itemSizeZ').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemSizeZ');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemsZ').updateValueAndValidity();
      if (pallet.type === 'CUSTOM') {
        this.stepCustom1.get('levelExists').updateValueAndValidity();
        if (pallet.diffOddEven) {
          this.stepCustom2.get('levelExists').updateValueAndValidity();
        }
      }
      this._doubleCheck = false;
    });
    this.step1.get('itemsZ').valueChanges.pipe(takeUntil(this.notifier)).subscribe(e=>{
      const ctrl = this.step1.get('itemsZ');
      if (this._doubleCheck || !ctrl.dirty) return;
      this._doubleCheck = true;
      this.step1.get('itemSizeZ').updateValueAndValidity();
      this._doubleCheck = false;
    });

    this.step2 = this._formBuilder.group({
      originX: ['', [Validators.required], this.validateOrigin.bind(this, 'x')],
      originY: ['', [Validators.required], this.validateOrigin.bind(this, 'y')],
      originZ: ['', [Validators.required], this.validateOrigin.bind(this, 'z')],
      posXX: ['', [Validators.required], this.validatePosX.bind(this, 'x')],
      posXY: ['', [Validators.required], this.validatePosX.bind(this, 'y')],
      posXZ: ['', [Validators.required], this.validatePosX.bind(this, 'z')],
      posYX: ['', [Validators.required], this.validatePosY.bind(this, 'x')],
      posYY: ['', [Validators.required], this.validatePosY.bind(this, 'y')],
      posYZ: ['', [Validators.required], this.validatePosY.bind(this, 'z')],
      calibrated: [
        false,
        Validators.requiredTrue,
        this.checkCalibrationStatus.bind(this),
      ],
    }, {
      updateOn: 'blur'
    });
    this.step3 = this._formBuilder.group({
      x: ['', [Validators.required], this.validateEntry.bind(this, 'x')],
      y: ['', [Validators.required], this.validateEntry.bind(this, 'y')],
      z: ['', [Validators.required], this.validateEntry.bind(this, 'z')],
      yaw: ['', [Validators.required], this.validateEntry.bind(this, 'yaw')],
      pitch: [
        '',
        [Validators.required],
        this.validateEntry.bind(this, 'pitch'),
      ],
      roll: ['', [Validators.required], this.validateEntry.bind(this, 'roll')],
      entryEnable: ['', []],
      flag0: [-1, [Validators.required, Validators.min(1)], this.validateFlag.bind(this, 0)],
      flag1: [-1, [Validators.required, Validators.min(1)], this.validateFlag.bind(this, 1)],
      flag2: [-1, [Validators.required, Validators.min(1)], this.validateFlag.bind(this, 2)],
    }, {
      updateOn: 'blur'
    });
    // disable unused flags
    const len = this.dataService.robotCoordinateType.flags.length;
    for (let i = len; i < 3; i++) {
      this.step3.controls['flag' + i].disable();
    }
    this.step4 = this._formBuilder.group({
      app_off_v: [
        '',
        [Validators.required],
        this.validateAppOffsetV.bind(this),
      ],
      app_off_h: [
        '',
        [Validators.required],
        this.validateAppOffsetH.bind(this),
      ],
      app_dir: ['', [Validators.required], this.validateAppDir.bind(this)],
      ret_off_v: [
        '',
        [Validators.required],
        this.validateRetOffsetV.bind(this),
      ],
      ret_off_h: [
        '',
        [Validators.required],
        this.validateRetOffsetH.bind(this),
      ],
      ret_dir: ['', [Validators.required], this.validateRetDir.bind(this)],
      appEnable: ['', []],
      retEnable: ['', []],
      appExceed: ['', []],
      retExceed: ['', []],
    }, {
      updateOn: 'blur'
    });
    this.stepCustom1 = this._formBuilder.group({
      levelExists: [
        '',
        [Validators.required, Validators.min(1)],
        this.validateLevel.bind(this, 1),
      ],
    });
    this.stepCustom2 = this._formBuilder.group({
      levelExists: [
        '',
        [Validators.required, Validators.min(1)],
        this.validateLevel.bind(this, 2),
      ],
    });
  }

  onLevelChange(i: number, itemCount: number) {
    const ctrl = i === 1 ? this.stepCustom1.controls['levelExists'] : this.stepCustom2.controls['levelExists'];
    ctrl.markAsDirty();
    ctrl.setValue(itemCount);
    if (itemCount === 0) { // force validation
      this.validateLevel(i, ctrl);
    }
  }

  get invalidOrigin() {
    if (this.step2) {
      return  this.step2.get('originX').invalid || this.step2.get('originY').invalid || this.step2.get('originZ').invalid ||
              this.step2.get('posXX').invalid || this.step2.get('posXY').invalid || this.step2.get('posXZ').invalid ||
              this.step2.get('posYX').invalid || this.step2.get('posYY').invalid || this.step2.get('posYZ').invalid;
    }
    return true;
  }

  toggleRetExceed(e: MatCheckboxChange, noQuery?: boolean) {
    if (noQuery) return;
    const val = e.checked ? 1 : 0;
    const name = this.dataService.selectedPallet.name;
    const cmd =
      '?PLT_SET_ALLOW_EXCEED_LIMIT("' + name + '","RETRACT",' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.dataService.selectedPallet.retExceed = !e.checked;
        return;
      }
      this.dataService.selectedPallet.retExceed = e.checked;
    });
  }

  toggleRetEnable(e: MatSlideToggleChange, noQuery?: boolean) {
    if (noQuery) {
      if (e.checked) {
        this.step4.controls['ret_off_v'].enable();
        this.step4.controls['ret_off_h'].enable();
        this.step4.controls['ret_dir'].enable();
        this.step4.controls['retExceed'].enable();
      } else {
        this.step4.controls['ret_off_v'].disable();
        this.step4.controls['ret_off_h'].disable();
        this.step4.controls['ret_dir'].disable();
        this.step4.controls['retExceed'].disable();
      }
      return;
    }
    const val = e.checked ? 1 : 0;
    const name = this.dataService.selectedPallet.name;
    const cmd = '?PLT_ENABLE_POST_PLACE("' + name + '",' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.dataService.selectedPallet.retEnabled = !e.checked;
        return;
      }
      this.dataService.selectedPallet.retEnabled = e.checked;
      if (e.checked) {
        this.step4.controls['ret_off_v'].enable();
        this.step4.controls['ret_off_h'].enable();
        this.step4.controls['ret_dir'].enable();
        this.step4.controls['retExceed'].enable();
      } else {
        this.step4.controls['ret_off_v'].disable();
        this.step4.controls['ret_off_h'].disable();
        this.step4.controls['ret_dir'].disable();
        this.step4.controls['retExceed'].disable();
      }
    });
  }

  toggleAppExceed(e: MatCheckboxChange, noQuery?: boolean) {
    if (noQuery) return;
    const val = e.checked ? 1 : 0;
    const name = this.dataService.selectedPallet.name;
    const cmd =
      '?PLT_SET_ALLOW_EXCEED_LIMIT("' + name + '","APPROACH",' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.dataService.selectedPallet.appExceed = !e.checked;
        return;
      }
      this.dataService.selectedPallet.appExceed = e.checked;
    });
  }

  toggleAppEnable(e: MatSlideToggleChange, noQuery?: boolean) {
    if (noQuery) {
      if (e.checked) {
        this.step4.controls['app_off_v'].enable();
        this.step4.controls['app_off_h'].enable();
        this.step4.controls['app_dir'].enable();
        this.step4.controls['appExceed'].enable();
      } else {
        this.step4.controls['app_off_v'].disable();
        this.step4.controls['app_off_h'].disable();
        this.step4.controls['app_dir'].disable();
        this.step4.controls['appExceed'].disable();
      }
      return;
    }
    const val = e.checked ? 1 : 0;
    const name = this.dataService.selectedPallet.name;
    const exceed = this.dataService.selectedPallet.appExceed ? 1 : 0;
    const cmd =
      '?PLT_ENABLE_PRE_PLACE("' + name + '",' + val + ')';
    this.ws.query(cmd).then((ret: MCQueryResponse) => {
      if (ret.result !== '0' || ret.err) {
        this.dataService.selectedPallet.appEnabled = !e.checked;
        return;
      }
      this.dataService.selectedPallet.appEnabled = e.checked;
      if (e.checked) {
        this.step4.controls['app_off_v'].enable();
        this.step4.controls['app_off_h'].enable();
        this.step4.controls['app_dir'].enable();
        this.step4.controls['appExceed'].enable();
      } else {
        this.step4.controls['app_off_v'].disable();
        this.step4.controls['app_off_h'].disable();
        this.step4.controls['app_dir'].disable();
        this.step4.controls['appExceed'].disable();
      }
    });
  }

  toggleEntryEnable(e: MatSlideToggleChange, noQuery?: boolean) {
    if (noQuery) {
      if (e.checked) {
        this.step3.controls['x'].enable();
        this.step3.controls['y'].enable();
        this.step3.controls['z'].enable();
        this.step3.controls['yaw'].enable();
        this.step3.controls['pitch'].enable();
        this.step3.controls['roll'].enable();
      } else {
        this.step3.controls['x'].disable();
        this.step3.controls['y'].disable();
        this.step3.controls['z'].disable();
        this.step3.controls['yaw'].disable();
        this.step3.controls['pitch'].disable();
        this.step3.controls['roll'].disable();
      }
      return;
    }
    const val = e.checked ? 1 : 0;
    const name = this.dataService.selectedPallet.name;
    this.ws
      .query('?PLT_ENABLE_ENTRY_POSITION("' + name + '",' + val + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0' || ret.err) {
          this.dataService.selectedPallet.entryEnabled = !e.checked;
          this.step3.controls['entryEnable'].setValue(!e.checked);
          return;
        }
        this.dataService.selectedPallet.entryEnabled = e.checked;
        if (e.checked) {
          this.step3.controls['x'].enable();
          this.step3.controls['y'].enable();
          this.step3.controls['z'].enable();
          this.step3.controls['yaw'].enable();
          this.step3.controls['pitch'].enable();
          this.step3.controls['roll'].enable();
        } else {
          this.step3.controls['x'].disable();
          this.step3.controls['y'].disable();
          this.step3.controls['z'].disable();
          this.step3.controls['yaw'].disable();
          this.step3.controls['pitch'].disable();
          this.step3.controls['roll'].disable();
        }
      });
  }

  async ngAfterViewInit() {
    await this.getPalletInfo();
    await this.refreshDesigners();
  }

  refreshDesigners() : Promise<any> {
    return new Promise(resolve=>{
      setTimeout(async()=>{
        let count = 0;
        if (this.designer) {
          this.designer.refresh();
          count += await this.designer.onPalletInfoLoaded();
        }
        if (this.designer2) {
          this.designer2.refresh();
          count += await this.designer2.onPalletInfoLoaded();
        }
        resolve();
      },0);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  blurActive() {
    (document.activeElement as HTMLElement).blur();
  }

  onWindowResize() {
    if (typeof this.container === 'undefined') {
      if (this.designer) this.designer.refresh();
      if (this.designer2) this.designer2.refresh();
      return;
    }
    this.getPreviewSize();
    let element = this.container.nativeElement;
    if (typeof element === 'undefined') return;
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    this.preview1.nativeElement.style.left = x + 'px';
    this.preview1.nativeElement.style.top = y + 'px';
    this.preview1.nativeElement.style.width =
      this.container.nativeElement.offsetWidth - 2 + 'px';
    this.preview1.nativeElement.style.height =
      this.container.nativeElement.offsetHeight - 2 + 'px';
    this.drawPreview1();
  }

  drawPreview1() {
    if (!this.step1.dirty && this.isPreview1Init) return;
    // clear canvas
    const canvas = this.preview1.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.isPreview1Init = true;
    const data = this.getPalletDrawingData();
    if (data.floor === null) {
      this.isPreview1Showing = false;
      return;
    }
    this.iso = new Isomer(canvas);
    this.iso.add(data.floor, floor); // add floor
    if (this.utils.IsKuka) {
      for (const item of data.items) {
        this.iso.add(item.shape, item.z % 2 === 0 ? kukaColor : kukaColor2);
      }
    }

    if (!this.utils.IsKuka) {
      for (const item of data.items) {
        this.iso.add(
          item.shape,
          item.z % 2 === 0 ? servotronixColor : servotronixColor2
        );
      }
    }
    this.isPreview1Showing = true;
  }

  save() {
    const name = this.dataService.selectedPallet.name;
    return this.ws.query('?PLT_STORE_PALLET_DATA("' + name + '")');
  }

  closeDialog(prompt: boolean) {
    if (prompt) {
      const name = this.dataService.selectedPallet.name;
      this.trn.get('pallets.wizard.save', { name }).subscribe(str => {
        const ref = this.dialog.open(YesNoDialogComponent, {
          data: {
            title: str,
            msg: '',
            yes: this.words['button.save'],
            no: this.words['button.discard'],
            allowClose: true
          },
        });
        ref.afterClosed().subscribe(ret => {
          if (ret === null) return;
          if (ret) {
            this.save();
          } else {
            this.ws.query('?PLT_RESTORE_PALLET("' + name + '")').then(ret=>{
              setTimeout(()=>{
                this.customKeyboards = null;
                this.getPalletInfo();
              }, 200);
            });
          }
          this.closed.emit();
        });
      });
    } else {
      this.closed.emit();
    }
  }

  onStepChange(e: StepperSelectionEvent) {
    const i = e.selectedIndex;
    const type = this.dataService.selectedPallet.type;
    if (type === 'CUSTOM') {
      if (i === 1) {
        this.designer.setPositions();
        this.designer.validateAll();
        this.onLevelChange(i, this.designer.items.length);
      } else if (i === 2  && this.dataService.selectedPallet.diffOddEven) {
        this.designer2.setPositions();
        this.designer2.validateAll();
      }
      else if(i === 3  && this.dataService.selectedPallet.diffOddEven || i=== 2){//step2 origin
        this.calibrate(null);
      }else if(i === 4  && this.dataService.selectedPallet.diffOddEven || i=== 3){ //step3 entry
        this.checkEntry();
      }
    }else if(i === 1){//step2 origin
      this.calibrate(null);
    }else if(i === 2){ //step3 entry
      this.checkEntry();
    }
  }

  private checkEntry(){
    this.step3.controls['roll'].setValue(this.dataService.selectedPallet.entry.roll);
    this.step3.controls['roll'].markAsDirty();
  }

  public setFormGroupItem(value: any,item: string,formGroup: FormGroup,onWindowResize: boolean = false,markAsDirty: boolean = true){
    // const newValue = Number(value);
    if(!formGroup.controls || !formGroup.controls[item] || formGroup.controls[item].value === value) return;

    if(isNaN(+value)){
      formGroup.setErrors({invalid: true});
      return;
    }
    markAsDirty && formGroup.controls[item].markAsDirty();
    formGroup.controls[item].setValue(value);
    onWindowResize && this.onWindowResize();

  }


  public initFormControl() {
    const selectedPallet = this.dataService.selectedPallet;
    if(!selectedPallet) return;
    const step1Control: any[] =
        [ {
            key:"itemsX",
            value:'itemsX',
            markAsDirty: false
          },
          {
            key:"itemsY",
            value:'itemsY',
            markAsDirty: false
          },
          {
            key:"itemsZ",
            value:'itemsZ',
            markAsDirty: true
          },
          {
            key:"itemSizeX",
            value:'itemSizeX',
            markAsDirty: false
          },
          {
            key:"itemSizeY",
            value:'itemSizeY',
            markAsDirty: false
          },
          {
            key:"itemSizeZ",
            value:'itemSizeZ',
            markAsDirty: true
          },
          {
            key:"palletSizeX",
            value:'palletSizeX',
            markAsDirty: false
          },
          {
            key:"palletSizeY",
            value:'palletSizeY',
            markAsDirty: true
          }];
    const step4Control: any[] = [
        {"key":"app_off_v","value":"approachOffsetVertical",markAsDirty: false},
        {"key":"app_off_h","value":"approachOffsetHorizontal",markAsDirty: true},
        {"key":"ret_off_v","value":"retractOffsetVertical",markAsDirty: false},
        {"key":"ret_off_h","value":"retractOffsetHorizontal",markAsDirty: true}
    ];
    this.setFormGroupItem(selectedPallet['levels'],'levels',this.step1,false,true);

    step1Control.forEach((item) => {
      this.setFormGroupItem(selectedPallet[item.value],item.key,this.step1,true,item.markAsDirty);
    });

    this.step2Origin(selectedPallet);
    this.step2posX(selectedPallet);
    this.step2posY(selectedPallet);

    this.step3Entry(selectedPallet);
    step4Control.forEach((item) => {
      // this.step4.controls[item.key].setValue(Number(this.dataService.selectedPallet[item.value]));
      this.setFormGroupItem(selectedPallet[item.value],item.key,this.step4,false,item.markAsDirty);
    });
}
onValidatorCheck(invalid: boolean,item: string,formGroup: FormGroup,){
  if(invalid) return;
  if(!formGroup.controls || !formGroup.controls[item]) return;
  formGroup.setErrors({invalid: true});
}

 private step2Origin(selectedPallet){
  const step2Control: any[] = [
    {key:"originX",value1:"origin",value2:"x",markAsDirty: false},
    {key:"originY",value1:"origin",value2:"y",markAsDirty: false},
    {key:"originZ",value1:"origin",value2:"z",markAsDirty: true}
  ];
  this.setStep2FormControl(step2Control,selectedPallet);

 }


 private step2posX(selectedPallet){
  const step2Control: any[] = [
    {key:"posXX",value1:"posX",value2:"x",markAsDirty: false},
    {key:"posXY",value1:"posX",value2:"y",markAsDirty: false},
    {key:"posXZ",value1:"posX",value2:"z",markAsDirty: true}
  ];
  this.setStep2FormControl(step2Control,selectedPallet);
 }


 private step2posY(selectedPallet){
  const step2Control: any[] = [
    {key:"posYX",value1:"posY",value2:"x",markAsDirty: false},
    {key:"posYY",value1:"posY",value2:"y",markAsDirty: false},
    {key:"posYZ",value1:"posY",value2:"z",markAsDirty: true}
  ];
  this.setStep2FormControl(step2Control,selectedPallet);
 }



 private setStep2FormControl(step2Control,selectedPallet){
  step2Control.forEach((item) => {
    this.setFormGroupItem(selectedPallet[item.value1][item.value2],item.key,this.step2,false,item.markAsDirty);
  });
 }

 private step3Entry(selectedPallet){
       const step3Control: any[] = [
      {
         key:"x",
         value:'x',
         markAsDirty: false
       }, {
         key:"y",
         value:'y',
         markAsDirty: false
       },  {
         key:"z",
         value:'z',
         markAsDirty: false
       },
       {
         key:"yaw",
         value:'yaw',
         markAsDirty: false
       }, {
         key:"pitch",
         value:'pitch',
         markAsDirty: false
       },  {
         key:"roll",
         value:'roll',
         markAsDirty: true
       }];
       step3Control.forEach((item) => {
        this.setFormGroupItem(selectedPallet.entry[item.value],item.key,this.step3,false,item.markAsDirty);
      })

 }

   private setErrorsKeyboard(items: any[], error){
     if(!this.customKeyboards) return;
     const children: any[] = this.customKeyboards['_results'] || [];
     children.map(node=>{
        if(items.includes(node.identificationTag)){
          node.setErrors(error);
          return;
        }
     });
   }
}
