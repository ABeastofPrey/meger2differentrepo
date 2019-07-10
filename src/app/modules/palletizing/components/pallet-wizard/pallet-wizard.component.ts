import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  HostListener,
  Output,
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
import { PalletLocation } from '../../../core/models/pallet.model';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {UtilsService} from '../../../core/services/utils.service';

declare var Isomer: any;

var Point = Isomer.Point;
var Path = Isomer.Path;
var Shape = Isomer.Shape;
var Vector = Isomer.Vector;
var Color = Isomer.Color;
var Canvas = Isomer.Canvas;
const floor = new Color(50, 50, 50);
const servotronixColor = new Color(0, 130, 130);
const servotronixColor2 = new Color(0, 78, 78);
const borderSize = 4;

const kukaColor2 = new Color(229, 156, 96);
const kukaColor = new Color(255, 115, 0);

@Component({
  selector: 'pallet-wizard',
  templateUrl: './pallet-wizard.component.html',
  styleUrls: ['./pallet-wizard.component.css'],
})
export class PalletWizardComponent implements OnInit {

  @Output() closed = new EventEmitter();

  loading: boolean = true;
  step1: FormGroup;
  step2: FormGroup;
  step3: FormGroup;
  step4: FormGroup;
  stepCustom1: FormGroup;
  stepCustom2: FormGroup;
  isCurrentRobotCompatible: boolean = true;
  lastError: string;
  isPreview1Showing: boolean = false;
  originPicName: string = 'origin.png';
  abnormalItemCount: boolean = false;

  previewWidth: number;
  previewHeight: number;

  @ViewChild('palletPreviewStep1', { static: false }) preview1: ElementRef;
  @ViewChild('palletContainer1', { static: false }) container: ElementRef;
  @ViewChild('designer', { static: false })
  designer: PalletLevelDesignerComponent;
  @ViewChild('designer2', { static: false })
  designer2: PalletLevelDesignerComponent;
  @ViewChild('stepper', { static: false }) stepper: MatHorizontalStepper;

  private iso: any = null;
  private isPreview1Init: boolean = false;
  private words: any;
  private _originResult: string = null;

  get originResult() {
    return this._originResult;
  }

  constructor(
    public dataService: DataService,
    private ws: WebsocketService,
    private _formBuilder: FormBuilder,
    private snack: MatSnackBar,
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
      case 0:
        this.originPicName = 'origin.png';
        break;
      case 1:
        this.originPicName = 'origin.gif';
        break;
      case 2:
        this.originPicName = 'origin2.gif';
        break;
      case 3:
        this.originPicName = 'origin3.gif';
        break;
    }
  }

  getPreviewSize() {
    if (this.container) {
      this.previewWidth = this.container.nativeElement.offsetWidth * 2;
      this.previewHeight = this.container.nativeElement.offsetWidth * 2;
    }
  }

  private getPalletInfo() {
    let name = this.dataService.selectedPallet.name;
    let queries: Promise<any>[] = [
      this.ws.query('?PLT_GET_PALLETIZING_ORDERS_LIST("' + name + '")'),
      this.ws.query('?plt_get_number_of_items("' + name + '")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","X")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Y")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Z")'),
      this.ws.query('?PLT_GET_PALLETIZING_ORDER("' + name + '")'),
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
      this.ws.query('?PLT_GET_ENTRY_POSITION("' + name + '")'),
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
    ];
    return Promise.all(queries).then((ret: MCQueryResponse[]) => {
      this.dataService.selectedPallet.orderList =
        ret[0].result.length === 0 ? [] : ret[0].result.split(',');
      let itemCount = (ret[1].result.length === 0
        ? '0,0,0'
        : ret[1].result
      ).split(',');
      this.dataService.selectedPallet.items_x = Number(itemCount[0]);
      this.dataService.selectedPallet.items_y = Number(itemCount[1]);
      this.dataService.selectedPallet.items_z = Number(itemCount[2]);
      this.dataService.selectedPallet.item_size_x = Number(ret[2].result);
      this.dataService.selectedPallet.item_size_y = Number(ret[3].result);
      this.dataService.selectedPallet.item_size_z = Number(ret[4].result);
      this.dataService.selectedPallet.order = ret[5].result;
      this.dataService.selectedPallet.origin = this.parseLocation(
        ret[6].result
      );
      this.dataService.selectedPallet.posX = this.parseLocation(ret[7].result);
      this.dataService.selectedPallet.posY = this.parseLocation(ret[8].result);
      this.isCurrentRobotCompatible = ret[10].result === '1';
      this.dataService.selectedPallet.entry = this.parseLocation(
        ret[11].result
      );
      this.dataService.selectedPallet.approach_direction = ret[12].result;
      this.dataService.selectedPallet.retract_direction = ret[13].result;
      this.dataService.selectedPallet.approach_offset_vertical = Number(
        ret[14].result
      );
      this.dataService.selectedPallet.approach_offset_horizontal = Number(
        ret[15].result
      );
      this.dataService.selectedPallet.retract_offset_vertical = Number(
        ret[16].result
      );
      this.dataService.selectedPallet.retract_offset_horizontal = Number(
        ret[17].result
      );
      this.dataService.selectedPallet.entryEnabled = ret[18].result === '1';
      this.dataService.selectedPallet.appEnabled = ret[19].result === '1';
      this.dataService.selectedPallet.retEnabled = ret[20].result === '1';
      const n = Number(ret[21].result);
      this.dataService.selectedPallet.index = n || 0;
      if (n) {
        this.step1.controls['index'].setValue('custom');
        this.step1.controls['index'].markAsDirty();
        this.onWindowResize();
      }
      this.dataService.selectedPallet.appExceed = ret[22].result === '1';
      this.dataService.selectedPallet.retExceed = ret[23].result === '1';
      let palletSizes = (ret[24].result.length === 0
        ? '0,0,0'
        : ret[24].result
      ).split(',');
      this.dataService.selectedPallet.pallet_size_x = Number(palletSizes[0]);
      this.dataService.selectedPallet.pallet_size_y = Number(palletSizes[1]);
      this.dataService.selectedPallet.pallet_size_z = Number(palletSizes[2]);
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
    });
  }

  private parseLocation(loc: string): PalletLocation {
    var result = new PalletLocation();
    if (loc === '#{}') return result;
    loc = loc
      .substring(2)
      .slice(0, -1)
      .trim();
    const parts = loc.split(',');
    result.x = Number(parts[0]);
    result.y = Number(parts[1]);
    result.z = Number(parts[2]);
    if (this.dataService.robotType === 'SCARA') {
      result.roll = Number(parts[3]);
    } else {
      result.yaw = Number(parts[3]);
      result.pitch = Number(parts[4]);
      result.roll = Number(parts[5]);
    }
    return result;
  }

  /*
   * Takes a pallet location and converts it into a user-readable string
   */
  locToString(loc: PalletLocation): string {
    var result = '#{' + loc.x + ',' + loc.y + ',' + loc.z + ',';
    if (this.dataService.robotType === 'SCARA') {
      result += loc.roll;
    } else {
      result += loc.yaw + ',' + loc.pitch + ',' + loc.roll;
    }
    result += '}';
    return result;
  }

  calibrate() {
    const p = this.dataService.selectedPallet;
    this.ws
      .query('?PLT_ORIGIN_CALIBRATION("' + p.name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          p.isFrameCalibrated = true;
          this.ws
            .query('?PLT_GET_ORIGIN("' + p.name + '")')
            .then((ret: MCQueryResponse) => {
              this._originResult = ret.result;
            });
        } else {
          this.dataService.selectedPallet.isFrameCalibrated = false;
        }
      });
  }

  private checkCalibrationStatus() {
    return this.ws
      .query(
        '?PLT_IS_ORIGIN_CALIBRATED("' +
          this.dataService.selectedPallet.name +
          '")'
      )
      .then((ret: MCQueryResponse) => {
        this.dataService.selectedPallet.isFrameCalibrated = ret.result === '1';
        return ret.err || ret.result === '0' ? { notCalibrated: true } : null;
      });
  }

  teachOrigin() {
    var pallet = this.dataService.selectedPallet;
    var robot = this.dataService.selectedRobot;
    this.ws
      .query(
        '?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","o",' + robot + ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('?PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","o")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.origin = this.parseLocation(
                ret.result
              );
            });
        }
      });
  }

  teachPosX() {
    var pallet = this.dataService.selectedPallet;
    var robot = this.dataService.selectedRobot;
    this.ws
      .query(
        '?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","x",' + robot + ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('?PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","x")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.posX = this.parseLocation(
                ret.result
              );
            });
        }
      });
  }

  teachPosY() {
    var pallet = this.dataService.selectedPallet;
    var robot = this.dataService.selectedRobot;
    this.ws
      .query(
        '?PLT_FRAME_CALIBRATION_TEACH("' + pallet.name + '","xy",' + robot + ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('?PLT_FRAME_CALIBRATION_GET("' + pallet.name + '","xy")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.posY = this.parseLocation(
                ret.result
              );
            });
        }
      });
  }

  teachEntry() {
    var pallet = this.dataService.selectedPallet;
    var robot = this.dataService.selectedRobot;
    this.ws
      .query('?PLT_TEACH_ENTRY_POSITION("' + pallet.name + '",' + robot + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.ws
            .query('?PLT_GET_ENTRY_POSITION("' + pallet.name + '")')
            .then((ret: MCQueryResponse) => {
              this.dataService.selectedPallet.entry = this.parseLocation(
                ret.result
              );
            });
        }
      });
  }

  onIndexChange(val?: number) {
    if (val) this.dataService.selectedPallet.index = val;
    this.step1.controls['index'].setValue(this.step1.controls['index'].value);
  }

  private validateIndex(control: AbstractControl) {
    var pallet = this.dataService.selectedPallet;
    if (typeof control.value === 'undefined') {
      return Promise.resolve(null);
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
        if (pallet.type === 'CUSTOM' && pallet.dataFile === null)
          return Promise.resolve(null);
        return Promise.resolve({ invalidIndex: true });
    }
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return this.ws
        .query('?PLT_GET_INDEX_STATUS("' + pallet.name + '")')
        .then((ret: MCQueryResponse) => {
          this.dataService.selectedPallet.index = Number(ret.result);
          this.onWindowResize();
          return null;
        });
    });
  }

  private getItemsXYZ(itemX: number, itemY: number, itemZ: number) {
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_z = Math.ceil(count / (pallet.items_x * pallet.items_y)) - 1;
    for (var z = 0; z <= max_z; z++) {
      var countForThisLevel = count;
      var max_y =
        z < max_z
          ? pallet.items_y - 1
          : Math.floor((countForThisLevel - 1) / pallet.items_x);
      for (var i = pallet.items_x - 1; i >= 0; i--) {
        for (var j = max_y; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          if (z < max_z || pallet.items_x * j + i < countForThisLevel) {
            // FULL FLOOR...
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
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
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_z = Math.ceil(count / (pallet.items_x * pallet.items_y)) - 1;
    for (var z = 0; z <= max_z; z++) {
      var countForThisLevel = count;
      var max_x =
        z < max_z
          ? pallet.items_x - 1
          : Math.floor((countForThisLevel - 1) / pallet.items_y);
      for (var i = max_x; i >= 0; i--) {
        for (var j = pallet.items_y - 1; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          if (z < max_z || pallet.items_y * i + j < countForThisLevel) {
            // FULL FLOOR...
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
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
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_y = Math.ceil(count / (pallet.items_z * pallet.items_x)) - 1;
    for (var z = 0; z < pallet.items_z; z++) {
      for (var i = pallet.items_x - 1; i >= 0; i--) {
        for (var j = max_y; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          var itemsSoFar =
            j * pallet.items_z * pallet.items_x + z * pallet.items_x + i + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
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
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_x = Math.ceil(count / (pallet.items_z * pallet.items_y)) - 1;
    for (var z = 0; z < pallet.items_z; z++) {
      for (var i = max_x; i >= 0; i--) {
        for (var j = pallet.items_y - 1; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          var itemsSoFar =
            i * pallet.items_z * pallet.items_y + z * pallet.items_y + j + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
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
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_x = Math.ceil(count / (pallet.items_z * pallet.items_y)) - 1;
    for (var z = 0; z < pallet.items_z; z++) {
      for (var i = max_x; i >= 0; i--) {
        for (var j = pallet.items_y - 1; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          var itemsSoFar =
            i * pallet.items_z * pallet.items_y + j * pallet.items_z + z + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
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
    let result = [];
    let pallet = this.dataService.selectedPallet;
    var count = pallet.index;
    var max_y = Math.ceil(count / (pallet.items_z * pallet.items_x)) - 1;
    for (var z = 0; z < pallet.items_z; z++) {
      for (var i = pallet.items_x - 1; i >= 0; i--) {
        for (var j = max_y; j >= 0; j--) {
          var x = i * itemX;
          var y = j * itemY;
          var itemsSoFar =
            j * pallet.items_z * pallet.items_x + i * pallet.items_z + z + 1;
          if (pallet.index >= itemsSoFar) {
            result.push({
              shape: Shape.Prism(
                Point(x, y, 0.4 + z * itemZ),
                itemX - borderSize / 100,
                itemY - borderSize / 100,
                itemZ - borderSize / 100
              ),
              z: z,
            });
            count--;
          }
          if (count === 0) return result;
        }
      }
    }
    return result;
  }

  private getPalletDrawingData(): any {
    var result = {
      floor: null,
      items: [],
    };
    let pallet = this.dataService.selectedPallet;
    if (typeof pallet.index === 'undefined') return result;
    if (pallet.items_y * pallet.items_x * pallet.items_z > 250) {
      this.abnormalItemCount = true;
      return result;
    }
    this.abnormalItemCount = false;
    if (
      pallet.items_x > 0 &&
      pallet.items_y > 0 &&
      pallet.items_z > 0 &&
      pallet.item_size_x > 0 &&
      pallet.item_size_y > 0 &&
      pallet.item_size_z > 0
    ) {
      var x = pallet.items_x * pallet.item_size_x;
      var y = pallet.items_y * pallet.item_size_y;
      var sizeByX = x > y;
      var mm = sizeByX ? 4 / x : 4 / y; // 1 millimeter
      var itemX = pallet.item_size_x * mm;
      var itemY = pallet.item_size_y * mm;
      var itemZ = pallet.item_size_z * mm;
      result.floor = sizeByX
        ? Shape.Prism(Point(0, 0, 0), 4, (4 * y) / x, 0.4)
        : Shape.Prism(Point(0, 0, 0), (4 * x) / y, 4, 0.4);
      switch (pallet.order) {
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
    if (this.dataService.selectedPallet.type === 'CUSTOM')
      return Promise.resolve(null);
    var cmd =
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
    if (i == 1 && this.dataService.selectedPallet.diffOddEven)
      return Promise.resolve(null);
    if (this.dataService.selectedPallet.type === 'GRID')
      return Promise.resolve(null);
    let data = null;
    if (i === 1 && this.designer) {
      data = this.designer.getDataAsString();
      if (data.length === 0) return Promise.resolve({ invalidDataFile: true });
      let file = this.dataService.selectedPallet.dataFile;
      return this.api.createPalletFile(data, file).then(
        fileName => {
          return fileName.length > 0 ? null : { invalidDataFile: true };
        },
        () => {
          return { invalidDataFile: true };
        }
      );
    } else if (this.designer2) {
      data = this.designer.getDataAsString();
      let data2 = this.designer2.getDataAsString();
      if (data.length === 0 || data2.length === 0)
        return Promise.resolve({ invalidDataFile: true });
      data = data + '---\n' + data2;
      let file = this.dataService.selectedPallet.dataFile;
      return this.api.createPalletFile(data, file).then(
        fileName => {
          if (fileName) {
            let cmd =
              '?PLT_SET_CUSTOM_PALLET_DATA_FILE("' +
              this.dataService.selectedPallet.name +
              '","' +
              fileName +
              '")';
            this.ws.query(cmd).then((ret: MCQueryResponse) => {
              if (ret.result === '0')
                this.dataService.selectedPallet.dataFile = fileName;
            });
          }
          return fileName.length > 0 ? null : { invalidDataFile: true };
        },
        () => {
          return { invalidDataFile: true };
        }
      );
    }
    return Promise.resolve(null);
  }

  private validateLevels(control: AbstractControl) {
    if (this.dataService.selectedPallet.type === 'GRID')
      return Promise.resolve(null);
    let pallet = this.dataService.selectedPallet.name;
    let cmd =
      '?PLT_SET_NUMBER_OF_LEVELS("' + pallet + '",' + control.value + ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidLevelCount: true } : null;
    });
  }

  private validateItems(changed: string, control: AbstractControl) {
    let pallet = this.dataService.selectedPallet;
    if (pallet.type === 'CUSTOM') {
      this.step1.controls['itemsX'].setErrors(null);
      this.step1.controls['itemsY'].setErrors(null);
      this.step1.controls['itemsZ'].setErrors(null);
      return Promise.resolve(null);
    }
    let x = changed === 'x' ? control.value : pallet.items_x;
    let y = changed === 'y' ? control.value : pallet.items_y;
    let z = changed === 'z' ? control.value : pallet.items_z;
    if (x && y && z) {
      var cmd =
        '?PLT_SET_NUMBER_OF_ITEMS("' +
        pallet.name +
        '",' +
        x +
        ',' +
        y +
        ',' +
        z +
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        this.onIndexChange();
        if (ret.err || ret.result !== '0') {
          this.step1.controls['itemsX'].setErrors({ invalidItemCount: true });
          this.step1.controls['itemsY'].setErrors({ invalidItemCount: true });
          this.step1.controls['itemsZ'].setErrors({ invalidItemCount: true });
          return { invalidItemCount: true };
        }
        this.step1.controls['itemsX'].setErrors(null);
        this.step1.controls['itemsY'].setErrors(null);
        this.step1.controls['itemsZ'].setErrors(null);
        return Promise.resolve(null);
      });
    }
    this.step1.controls['itemsX'].setErrors({ invalidItemCount: true });
    this.step1.controls['itemsY'].setErrors({ invalidItemCount: true });
    this.step1.controls['itemsZ'].setErrors({ invalidItemCount: true });
    return Promise.resolve(null);
  }

  private validateItemSizeX(control: AbstractControl) {
    var pallet = this.dataService.selectedPallet;
    var cmd =
      '?PLT_SET_ITEM_DIMENSION("' +
      pallet.name +
      '","X",' +
      control.value +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidSizeX: true } : null;
    });
  }

  private validateItemSizeY(control: AbstractControl) {
    var pallet = this.dataService.selectedPallet;
    var cmd =
      '?PLT_SET_ITEM_DIMENSION("' +
      pallet.name +
      '","Y",' +
      control.value +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidSizeX: true } : null;
    });
  }

  private validateItemSizeZ(control: AbstractControl) {
    var pallet = this.dataService.selectedPallet;
    var cmd =
      '?PLT_SET_ITEM_DIMENSION("' +
      pallet.name +
      '","Z",' +
      control.value +
      ')';
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      return ret.err || ret.result !== '0' ? { invalidSizeX: true } : null;
    });
  }

  private validatePalletSize(changed: string, control: AbstractControl) {
    let pallet = this.dataService.selectedPallet.name;
    let x =
      changed === 'x'
        ? control.value
        : this.dataService.selectedPallet.pallet_size_x;
    let y =
      changed === 'y'
        ? control.value
        : this.dataService.selectedPallet.pallet_size_y;
    let z =
      changed === 'z'
        ? control.value
        : this.dataService.selectedPallet.pallet_size_z;
    if (x && y && z) {
      if (!control.touched && !control.dirty) return Promise.resolve(null);
      var cmd =
        '?PLT_SET_PALLET_SIZE("' + pallet + '",' + x + ',' + y + ',' + z + ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step1.controls['palletSizeX'].setErrors({ invalidSize: true });
          this.step1.controls['palletSizeY'].setErrors({ invalidSize: true });
          this.step1.controls['palletSizeZ'].setErrors({ invalidSize: true });
          return { invalidSize: true };
        }
        this.step1.controls['palletSizeX'].setErrors(null);
        this.step1.controls['palletSizeY'].setErrors(null);
        this.step1.controls['palletSizeZ'].setErrors(null);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validateOrigin(changed: string, control: AbstractControl) {
    var origin = this.dataService.selectedPallet.origin;
    let x = changed === 'x' ? control.value : origin.x;
    let y = changed === 'y' ? control.value : origin.y;
    let z = changed === 'z' ? control.value : origin.z;
    if (
      typeof x !== 'undefined' &&
      typeof y !== 'undefined' &&
      typeof z !== 'undefined'
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
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['originX'].setErrors({ invalidOrigin: true });
          this.step2.controls['originY'].setErrors({ invalidOrigin: true });
          this.step2.controls['originZ'].setErrors({ invalidOrigin: true });
          return { invalidOrigin: true };
        }
        this.step2.controls['originX'].setErrors(null);
        this.step2.controls['originY'].setErrors(null);
        this.step2.controls['originZ'].setErrors(null);
        this.step2.controls['calibrated'].setValue(false);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validatePosX(changed: string, control: AbstractControl) {
    var pos = this.dataService.selectedPallet.posX;
    let x = changed === 'x' ? control.value : pos.x;
    let y = changed === 'y' ? control.value : pos.y;
    let z = changed === 'z' ? control.value : pos.z;
    if (x !== null && y !== null && z !== null) {
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
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['posXX'].setErrors({ invalidPosX: true });
          this.step2.controls['posXY'].setErrors({ invalidPosX: true });
          this.step2.controls['posXZ'].setErrors({ invalidPosX: true });
          return { invalidOrigin: true };
        }
        this.step2.controls['posXX'].setErrors(null);
        this.step2.controls['posXY'].setErrors(null);
        this.step2.controls['posXZ'].setErrors(null);
        this.step2.controls['calibrated'].setValue(false);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validatePosY(changed: string, control: AbstractControl) {
    var pos = this.dataService.selectedPallet.posY;
    let x = changed === 'x' ? control.value : pos.x;
    let y = changed === 'y' ? control.value : pos.y;
    let z = changed === 'z' ? control.value : pos.z;
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
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step2.controls['posYX'].setErrors({ invalidPosY: true });
          this.step2.controls['posYY'].setErrors({ invalidPosY: true });
          this.step2.controls['posYZ'].setErrors({ invalidPosY: true });
          return { invalidOrigin: true };
        }
        this.step2.controls['posYX'].setErrors(null);
        this.step2.controls['posYY'].setErrors(null);
        this.step2.controls['posYZ'].setErrors(null);
        this.step2.controls['calibrated'].setValue(false);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validateEntry(changed: string, control: AbstractControl) {
    var pos = this.dataService.selectedPallet.entry;
    let x = changed === 'x' ? control.value : pos.x;
    let y = changed === 'y' ? control.value : pos.y;
    let z = changed === 'z' ? control.value : pos.z;
    let yaw = changed === 'yaw' ? control.value : pos.yaw;
    let pitch = changed === 'pitch' ? control.value : pos.pitch;
    let roll = changed === 'roll' ? control.value : pos.roll;
    if (x !== null && y !== null && z !== null && roll !== null) {
      let loc = 'castpoint(#{' + x + ',' + y + ',' + z + ',';
      if (this.dataService.robotType === 'PUMA') {
        if (yaw !== null && pitch !== null) loc += yaw + ',' + pitch + ',';
        else return Promise.resolve(null);
      }
      loc +=
        roll + '},' + 'robottype(' + this.dataService.selectedRobot + '.Here))';
      var cmd =
        '?PLT_SET_ENTRY_POSITION("' +
        this.dataService.selectedPallet.name +
        '",' +
        loc +
        ')';
      return this.ws.query(cmd).then((ret: MCQueryResponse) => {
        if (ret.err || ret.result !== '0') {
          this.step3.controls['x'].setErrors({ invalidEntry: true });
          this.step3.controls['y'].setErrors({ invalidEntry: true });
          this.step3.controls['z'].setErrors({ invalidEntry: true });
          this.step3.controls['yaw'].setErrors({ invalidEntry: true });
          this.step3.controls['pitch'].setErrors({ invalidEntry: true });
          this.step3.controls['roll'].setErrors({ invalidEntry: true });
          return { invalidEntry: true };
        }
        this.step3.controls['x'].setErrors(null);
        this.step3.controls['y'].setErrors(null);
        this.step3.controls['z'].setErrors(null);
        this.step3.controls['yaw'].setErrors(null);
        this.step3.controls['pitch'].setErrors(null);
        this.step3.controls['roll'].setErrors(null);
        return Promise.resolve(null);
      });
    }
    return Promise.resolve(null);
  }

  private validateAppOffsetV(control: AbstractControl) {
    var pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    var off = control.value;
    var cmd =
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
    var pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    var off = control.value;
    var cmd =
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
    var pallet = this.dataService.selectedPallet;
    if (!pallet.appEnabled) return Promise.resolve(null);
    var dir = control.value;
    var cmd =
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
    var pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    var off = control.value;
    var cmd =
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
    var pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    var off = control.value;
    var cmd =
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
    var pallet = this.dataService.selectedPallet;
    if (!pallet.retEnabled) return Promise.resolve(null);
    var dir = control.value;
    var cmd =
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
    var name = this.dataService.selectedPallet.name;
    this.ws
      .query('?PLT_ENABLE_PALLET("' + name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result === '0') {
          this.closeDialog(false);
        }
      });
  }

  ngOnInit() {
    var pallet = this.dataService.selectedPallet;
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
        [Validators.required, Validators.min(10)],
        this.validatePalletSize.bind(this, 'x'),
      ],
      palletSizeY: [
        '',
        [Validators.required, Validators.min(10)],
        this.validatePalletSize.bind(this, 'y'),
      ],
      palletSizeZ: [
        '',
        [Validators.required, Validators.min(10)],
        this.validatePalletSize.bind(this, 'z'),
      ],
      index: [null, [], this.validateIndex.bind(this)],
      levels:
        pallet.type === 'GRID'
          ? ['']
          : [
              '',
              [Validators.required, Validators.min(1)],
              this.validateLevels.bind(this),
            ],
      diffOddEven: [''],
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
    });
    this.step4 = this._formBuilder.group({
      app_off_v: [
        '',
        [Validators.required, Validators.min(0)],
        this.validateAppOffsetV.bind(this),
      ],
      app_off_h: [
        '',
        [Validators.required, Validators.min(0)],
        this.validateAppOffsetH.bind(this),
      ],
      app_dir: ['', [Validators.required], this.validateAppDir.bind(this)],
      ret_off_v: [
        '',
        [Validators.required, Validators.min(0)],
        this.validateRetOffsetV.bind(this),
      ],
      ret_off_h: [
        '',
        [Validators.required, Validators.min(0)],
        this.validateRetOffsetH.bind(this),
      ],
      ret_dir: ['', [Validators.required], this.validateRetDir.bind(this)],
      appEnable: ['', []],
      retEnable: ['', []],
      appExceed: ['', []],
      retExceed: ['', []],
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
    if (i === 1) this.stepCustom1.controls['levelExists'].setValue(itemCount);
    else this.stepCustom2.controls['levelExists'].setValue(itemCount);
  }

  toggleRetExceed(e: MatCheckboxChange, noQuery?: boolean) {
    if (noQuery) return;
    let val = e.checked ? 1 : 0;
    let retEnabled = this.dataService.selectedPallet.retEnabled ? 1 : 0;
    let name = this.dataService.selectedPallet.name;
    let cmd =
      '?PLT_ENABLE_POST_PLACE("' + name + '",' + retEnabled + ',' + val + ')';
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
    let val = e.checked ? 1 : 0;
    let name = this.dataService.selectedPallet.name;
    let exceed = this.dataService.selectedPallet.retExceed ? 1 : 0;
    let cmd =
      '?PLT_ENABLE_POST_PLACE("' + name + '",' + val + ',' + exceed + ')';
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
    let val = e.checked ? 1 : 0;
    let enabled = this.dataService.selectedPallet.appEnabled ? 1 : 0;
    let name = this.dataService.selectedPallet.name;
    let cmd =
      '?PLT_ENABLE_PRE_PLACE("' + name + '",' + enabled + ',' + val + ')';
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
    let val = e.checked ? 1 : 0;
    let name = this.dataService.selectedPallet.name;
    let exceed = this.dataService.selectedPallet.appExceed ? 1 : 0;
    let cmd =
      '?PLT_ENABLE_PRE_PLACE("' + name + '",' + val + ',' + exceed + ')';
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
    var val = e.checked ? 1 : 0;
    var name = this.dataService.selectedPallet.name;
    this.ws
      .query('?PLT_ENABLE_ENTRY_POSITION("' + name + '",' + val + ')')
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0' || ret.err) {
          this.dataService.selectedPallet.entryEnabled = !e.checked;
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

  ngAfterViewInit() {
    this.getPalletInfo().then(() => {
      if (this.designer) {
        this.designer.onPalletInfoLoaded();
      }
      if (this.designer2) {
        this.designer2.onPalletInfoLoaded();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  onWindowResize() {
    console.log(this.container);
    if (typeof this.container === 'undefined') {
      if (this.designer) this.designer.refresh();
      if (this.designer2) this.designer2.refresh();
      return;
    }
    this.getPreviewSize();
    let element: any = this.container.nativeElement;
    console.log(element);
    if (typeof element === 'undefined') return;
    var x = 0;
    var y = 0;
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
    var canvas = this.preview1.nativeElement;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.isPreview1Init = true;
    var data = this.getPalletDrawingData();
    if (data.floor === null) {
      this.isPreview1Showing = false;
      return;
    }
    this.iso = new Isomer(canvas);
    this.iso.add(data.floor, floor); // add floor
    if (this.utils.IsKuka) {
    for (let item of data.items) {
        this.iso.add(item.shape, (item.z%2===0) ? kukaColor : kukaColor2);
      }
    }

    if (!this.utils.IsKuka) {
      for (let item of data.items) {
        this.iso.add(item.shape, (item.z%2===0) ? servotronixColor : servotronixColor2);
    }
    }
    this.isPreview1Showing = true;
  }

  closeDialog(prompt: boolean) {
    if (prompt) {
      let name = this.dataService.selectedPallet.name;
      this.trn.get('pallets.wizard.save', { name: name }).subscribe(str => {
        let ref = this.dialog.open(YesNoDialogComponent, {
          data: {
            title: str,
            msg: '',
            yes: this.words['button.save'],
            no: this.words['button.discard'],
          },
        });
        ref.afterClosed().subscribe(ret => {
          if (ret) this.ws.query('?PLT_STORE_PALLET_DATA("' + name + '")');
          this.closed.emit();
        });
      });
    } else {
      this.closed.emit();
    }
  }
}
