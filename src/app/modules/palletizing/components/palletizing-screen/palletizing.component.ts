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

  // tslint:disable-next-line: no-any
  private iso: any = null;
  private adjustedMaxSize: number;
  private scaleFactor = 1;
  private words: {};

  abnormalItemCount = false;
  wizardMode = false;

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
      let element: HTMLElement = this.container.nativeElement;
      if (typeof element === 'undefined') return;
      let x = 0;
      let y = 0;
      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent as HTMLElement;
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

  private isPalletNew() : Promise<boolean | null> {
    const name = this.data.selectedPallet.name;
    return this.ws.query(`?PLT_IS_PALLET_SAVED("${name}")`).then(ret=>{
      if (ret.result === '1') return false;
      if (ret.result === '0') return true;
      return null;
    });
  }

  private async getPalletInfo() {
    const name = this.data.selectedPallet.name;
    const isNew = await this.isPalletNew();
    if (isNew === null || isNew) {
      this.data.selectedPallet.reset();
      return;
    }
    const queries = [
      this.ws.query('?plt_get_number_of_items("' + name + '")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","X")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Y")'),
      this.ws.query('?PLT_GET_ITEM_DIMENSION("' + name + '","Z")'),
      this.ws.query('?PLT_GET_PALLETIZING_ORDER("' + name + '")'),
      this.ws.query('?PLT_GET_INDEX_STATUS("' + name + '")'),
    ];
    return Promise.all(queries).then(ret => {
      const itemCount = ret[0].result.split(',');
      this.data.selectedPallet.itemsX = Number(itemCount[0]);
      this.data.selectedPallet.itemsY = Number(itemCount[1]);
      this.data.selectedPallet.itemsZ = Number(itemCount[2]);
      this.data.selectedPallet.itemSizeX = Number(ret[1].result);
      this.data.selectedPallet.itemSizeY = Number(ret[2].result);
      this.data.selectedPallet.itemSizeZ = Number(ret[3].result);
      this.data.selectedPallet.order = ret[4].result;
      this.data.selectedPallet.index = Number(ret[5].result);
    });
  }

  addPallet() {
    this.dialog.open(AddPalletDialogComponent, { width: '400px' }).afterClosed()
    .subscribe((ret: NewPalletOptions) => {
      if (ret) {
        const name = ret.name.toUpperCase();
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
        this.dialog.open(YesNoDialogComponent, {
          data: {
            title: word,
            msg: this.words['pallets.delete.msg'],
            yes: this.words['button.delete'],
            no: this.words['button.cancel'],
          },
        }).afterClosed().subscribe(ret => {
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
    const canvas = this.preview.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const data = this.getPalletDrawingData();
    if (data.floor === null) {
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
  }

  private getItemsXYZ(itemX: number, itemY: number, itemZ: number) {
    const result = [];
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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
    const pallet = this.data.selectedPallet;
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
                Point(x, y, this.adjustedMaxSize / 10 + z * itemZ),
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

  private getPalletDrawingData() {
    const result = {
      floor: null,
      items: [],
    };
    this.adjustedMaxSize = maxXYsize * this.scaleFactor;
    const pallet = this.data.selectedPallet;
    if (pallet === null || typeof pallet.index === 'undefined') return result;
    if (pallet.itemsY * pallet.itemsX * pallet.itemsZ > 250) {
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
      const mm = sizeByX ? this.adjustedMaxSize / x : this.adjustedMaxSize / y; // 1 millimeter
      const itemX = pallet.itemSizeX * mm;
      const itemY = pallet.itemSizeY * mm;
      const itemZ = pallet.itemSizeZ * mm;
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

  get palletBgImgUrl(): string {
    const imgName = this.utils.IsKuka
      ? 'kuka_pallet.jpg'
      : 'servotronix_pallet.jpg';
    const imgUrl = `assets/pics/pallet/${imgName}`;
    return imgUrl;
  }
}
