import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataService, WebsocketService, MCQueryResponse } from '../../../core';
import {
  NewPalletOptions,
  AddPalletDialogComponent,
} from '../add-pallet-dialog/add-pallet-dialog.component';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';

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
const borderSize = 5;
const maxXYsize = 10;

const kukaColor2 = new Color(229, 156, 96);
const kukaColor = new Color(255, 115, 0);

@Component({
  selector: 'pallet-screen',
  templateUrl: './palletizing.component.html',
  styleUrls: ['./palletizing.component.css'],
})
export class PalletizingComponent implements OnInit {
  @ViewChild('palletPreview', { static: false }) preview: ElementRef;
  @ViewChild('palletContainer', { static: false }) container: ElementRef;

  private iso: any = null;
  private adjustedMaxSize: number;
  private scaleFactor: number = 1;
  private words: any;

  abnormalItemCount: boolean = false;
  wizardMode: boolean = false;

  constructor(
    public data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private trn: TranslateService,
    private utils: UtilsService
  ) {
    this.trn
      .get(['button.delete', 'button.cancel', 'pallets.delete.msg'])
      .subscribe(words => {
        this.words = words;
      });
  }

  ngOnInit() {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  onWindowResize() {
    if (this.container) {
      var element: any = this.container.nativeElement;
      if (typeof element === 'undefined') return;
      var x = 0;
      var y = 0;
      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      } while (element);
      // Position blocklyDiv over blocklyArea.
      this.preview.nativeElement.style.left = x + 'px';
      this.preview.nativeElement.style.top = y + 'px';
      this.preview.nativeElement.style.width =
        this.container.nativeElement.offsetWidth + 'px';
      this.preview.nativeElement.style.height =
        this.container.nativeElement.offsetHeight + 'px';
      this.drawPreview();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onWindowResize();
    }, 200);
  }

  private getPalletInfo() {
    let name = this.data.selectedPallet.name;
    let queries: Promise<any>[] = [
      this.ws.query('?plt_get_number_of_items("' + name + '")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","X")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Y")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Z")'),
      this.ws.query('?PLT_GET_PALLETIZING_ORDER("' + name + '")'),
      this.ws.query('?PLT_GET_INDEX_STATUS("' + name + '")'),
    ];
    return Promise.all(queries).then((ret: MCQueryResponse[]) => {
      var itemCount = ret[0].result.split(',');
      this.data.selectedPallet.items_x = Number(itemCount[0]);
      this.data.selectedPallet.items_y = Number(itemCount[1]);
      this.data.selectedPallet.items_z = Number(itemCount[2]);
      this.data.selectedPallet.item_size_x = Number(ret[1].result);
      this.data.selectedPallet.item_size_y = Number(ret[2].result);
      this.data.selectedPallet.item_size_z = Number(ret[3].result);
      this.data.selectedPallet.order = ret[4].result;
      this.data.selectedPallet.index = Number(ret[5].result);
    });
  }

  addPallet() {
    let ref = this.dialog.open(AddPalletDialogComponent, {
      width: '400px',
    });
    ref.afterClosed().subscribe((ret: NewPalletOptions) => {
      if (ret) {
        let name = ret.name.toUpperCase();
        this.ws
          .query(
            '?PLT_ASSIGN_PALLET("' +
              name +
              '","' +
              ret.type +
              '",' +
              this.data.selectedRobot +
              ')'
          )
          .then((response: MCQueryResponse) => {
            if (response.err || response.result !== '0') return;
            this.data.refreshPallets(name).then(() => {
              if (ret.showWizard) this.editPallet();
              else this.drawPreview();
            });
          });
      }
    });
  }

  editPallet() {
    this.wizardMode = true;
  }

  onWizardClose() {
    this.wizardMode = false;
    setTimeout(() => {
      this.onWindowResize();
    }, 0);
  }

  deletePallet() {
    this.trn
      .get('pallets.delete.title', { name: this.data.selectedPallet.name })
      .subscribe(word => {
        let ref = this.dialog.open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words['pallets.delete.msg'],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
          },
        });
        ref.afterClosed().subscribe(ret => {
          if (ret) {
            this.ws
              .query(
                '?PLT_RESET_PALLET("' + this.data.selectedPallet.name + '")'
              )
              .then((response: MCQueryResponse) => {
                if (response.err || response.result !== '0') return;
                this.data.selectedPallet = null;
                this.data.refreshPallets();
                this.drawPreview();
              });
          }
        });
      });
  }

  drawPreview() {
    var canvas = this.preview.nativeElement;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var data = this.getPalletDrawingData();
    if (data.floor === null) {
      return;
    }
    this.iso = new Isomer(canvas);
    this.iso.add(data.floor, floor); // add floor
    if (this.utils.IsKuka) {
      for (let item of data.items) {
        this.iso.add(item.shape, item.z % 2 === 0 ? kukaColor : kukaColor2);
      }
    }

    if (!this.utils.IsKuka) {
      for (let item of data.items) {
        this.iso.add(
          item.shape,
          item.z % 2 === 0 ? servotronixColor : servotronixColor2
        );
      }
    }
  }

  private getItemsXYZ(itemX: number, itemY: number, itemZ: number) {
    let result = [];
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    let pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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

  scale(factor: number) {
    this.scaleFactor += factor;
    if (this.scaleFactor <= 0) {
      this.scaleFactor -= factor;
      return;
    }
    this.drawPreview();
  }

  onPalletChange() {
    this.getPalletInfo().then(() => {
      this.scaleFactor = 1;
      this.drawPreview();
    });
  }

  private getPalletDrawingData(): any {
    var result = {
      floor: null,
      items: [],
    };
    this.adjustedMaxSize = maxXYsize * this.scaleFactor;
    let pallet = this.data.selectedPallet;
    if (pallet === null || typeof pallet.index === 'undefined') return result;
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
      var mm = sizeByX ? this.adjustedMaxSize / x : this.adjustedMaxSize / y; // 1 millimeter
      var itemX = pallet.item_size_x * mm;
      var itemY = pallet.item_size_y * mm;
      var itemZ = pallet.item_size_z * mm;
      result.floor = sizeByX
        ? Shape.Prism(
            Point(0, 0, 0),
            this.adjustedMaxSize,
            (this.adjustedMaxSize * y) / x,
            this.adjustedMaxSize / 10
          )
        : Shape.Prism(
            Point(0, 0, 0),
            (this.adjustedMaxSize * x) / y,
            this.adjustedMaxSize,
            this.adjustedMaxSize / 10
          );
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

  public get palletBgImgUrl(): string {
    const imgName = this.utils.IsKuka
      ? 'kuka_pallet.jpg'
      : 'servotronix_pallet.jpg';
    const imgUrl = `assets/pics/pallet/${imgName}`;
    return imgUrl;
  }
}
