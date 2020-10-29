import { SysLogSnackBarService } from './../../../sys-log/services/sys-log-snack-bar.service';
import { UtilsService } from './../../../core/services/utils.service';
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { MatDialog, MatChipEvent } from '@angular/material';
import { CustomItemMenuComponent } from '../custom-item-menu/custom-item-menu.component';
import { Pallet } from '../../../core/models/pallet.model';
import { ApiService } from '../../../core';

declare var $;

const epsilon = 0.1;

@Component({
  selector: 'pallet-level-designer',
  templateUrl: './pallet-level-designer.component.html',
  styleUrls: ['./pallet-level-designer.component.css'],
})
export class PalletLevelDesignerComponent implements OnInit {
  @Input('pallet') pallet: Pallet;
  @Output('change') changed = new EventEmitter<number>();
  @Input('level') level: number;
  @Input('errors') errors: {invalidDataFile: string[]};
  @Input('static') static: boolean;
  rotation = 0;
  normalizePreview = 1;
  normalizeItem = 1;

  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('upload', { static: false }) uploadInput: ElementRef;

  get items() {
    return this._items;
  }

  get errorList() {
    let result = [];
    if (!this.errors) {
      return result;
    }
    const data = this.errors.invalidDataFile || [];
    const internalErrors = this._items.filter(item=>item.error).map(item=>item.order.toString());
    result = data.concat(internalErrors);
    return result;
  }

  private _items: CustomPalletItem[] = [];
  private _order = 1;
  private _initDone = false;

  get initDone() {
    return this._initDone;
  }

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private utils: UtilsService,
    private cd: ChangeDetectorRef,
    private snackbarService: SysLogSnackBarService
  ) {}

  showMenu(item: CustomPalletItem) {
    const ref = this.dialog.open(CustomItemMenuComponent, {
      disableClose: false,
      data: {
        items: this._items,
        order: item.order,
      },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 1) {
          // delete
          this.removeItem(item.order - 1);
        } else if (result.action === 2) {
          this.changeOrder(item.order, result.newVal);
        }
      }
    });
  }

  reset() {
    this._items = [];
    this._order = 1;
    this.changed.emit(0);
  }

  refresh() {
    if (!this.container) return;
    const width = this.pallet.itemSizeX;
    const height = this.pallet.itemSizeY;
    const max = width > height ? width : height;
    this.normalizePreview = max / 70;
    this.normalizeItem = max / 100;
    const pWidth = this.pallet.palletSizeX;
    const pHeight = this.pallet.palletSizeY;
    if (pHeight / 270 > this.normalizeItem) this.normalizeItem = pHeight / 270;
    if (pWidth / 550 > this.normalizeItem) this.normalizeItem = pWidth / 550;
    this.container.nativeElement.style.width =
      pWidth / this.normalizeItem + 'px';
    this.container.nativeElement.style.height =
      pHeight / this.normalizeItem + 'px';
  }

  validate(item: CustomPalletItem, skipEmitter?: boolean) {
    // CALLED AFTER EVERY DRAG
    item.untouched = false;
    const element: HTMLElement = item.element;
    const elementRect = element.getBoundingClientRect();
    const containerRect = ((
      this.container.nativeElement
    ) as HTMLElement).getBoundingClientRect();

    const left = element.getBoundingClientRect().left - containerRect.left;
    const top = element.getBoundingClientRect().top - containerRect.top;
    const width = element.getBoundingClientRect().width;
    const height = element.getBoundingClientRect().height;

    // FIND COORDIANTED OF BOTTOM LEFT CORNER
    const x = left;
    const y = containerRect.bottom - elementRect.bottom;

    // UPDATE ITEM WITH NEW POSITION
    item.x = x * this.normalizeItem;
    item.y = y * this.normalizeItem;

    let error = false;

    // CHECK BOUNDS
    if (left + width - containerRect.width >= 1 || left < 0) {
      error = true;
    } else if (top + height - containerRect.height >= 1 || top < 0) {
      error = true;
    }

    // COMPARE ITEM TO ALL OTHER ITEMS
    for (const other of this._items) {
      if (error) break;
      if (other === item) continue;
      const otherLeft =
        other.element.getBoundingClientRect().left - containerRect.left;
      const otherTop =
        other.element.getBoundingClientRect().top - containerRect.top;
      const otherWidth = other.element.getBoundingClientRect().width;
      const otherHeight = other.element.getBoundingClientRect().height;
      if (
        (otherTop + otherHeight > top + epsilon && otherTop <= top) ||
        (top + height > otherTop + epsilon && top <= otherTop)
      ) {
        if (
          otherLeft === left ||
          (otherLeft < left && otherLeft + otherWidth > left + epsilon) ||
          (otherLeft > left && left + width > otherLeft + epsilon)
        ) {
          error = true;
        }
      }
    }
    item.error = error;
    if (!skipEmitter) {
      this.changed.emit(this._items.length);
    }
    setTimeout(()=>{
      (this.container.nativeElement as HTMLElement).click();
      this.cd.detectChanges();
    },200);
  }

  ngOnInit() {
    this.refresh();
  }

  validateAll() {
    for (const item of this._items) {
      this.validate(item, true);
    }
  }

  onPalletInfoLoaded() : Promise<number> {
    if (this.pallet.dataFile) {
      return this.api.getPathFile(this.pallet.dataFile).then(content => {
        this.setDataFromString(content);
        this._initDone = true;
        return this.items.length;
      });
    }
    return Promise.resolve(0);
  }

  rotate() {
    this.rotation += 90;
    if (this.rotation === 360) this.rotation = 0;
  }

  addItem() {
    const isFirst = this._items.length === 0;
    const item: CustomPalletItem = {
      x: 0,
      y: 0,
      r: this.rotation,
      order: this._order++,
      error: false,
      element: null,
      untouched: !isFirst,
    };
    this._items.push(item);
    this.changed.emit(this._items.length);
    setTimeout(()=>{
      this.validate(item);
    });
  }

  removeItem(index: number) {
    this._items.splice(index, 1);
    for (let i = index; i < this._items.length; i++) this._items[i].order--;
    this._order--;
    this.changed.emit(this._items.length);
  }

  onChipRemoved(e: string) {
    const i = Number(e);
    if (isNaN(i)) return;
    this.removeItem(i - 1);
  }

  getDataAsString(): string {
    let result = '';
    for (const item of this._items) {
      result += Math.round(item.x) + ',' + Math.round(item.y) + ',' + item.r + '\n';
    }
    return result;
  }

  private setDataFromString(str: string, setOnlyThisLevel?: boolean) {
    const lines = str.split('\n');
    const items: CustomPalletItem[] = [];
    let inFirstLevel = true;
    let itemsOnFirstLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length === 0) continue;
      if (line.indexOf('---') >= 0) {
        inFirstLevel = false;
        continue;
      }
      if (!setOnlyThisLevel && inFirstLevel) {
        itemsOnFirstLevel++;
        if (this.level === 2) {
          continue;
        }
      } else if (this.level === 1 && !setOnlyThisLevel) {
        break;
      }
      const parts = line.split(',');
      if (parts.length !== 3) continue;
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      const r = Number(parts[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
        const item = {
          x,
          y,
          r,
          order: this.level === 1 || setOnlyThisLevel ? i + 1 : i - itemsOnFirstLevel,
          error: false,
          element: null,
          untouched: false,
        };
        items.push(item);
      }
    }
    this._items = items;
    this._order = items.length + 1;
    this.changed.emit(this._items.length);
    setTimeout(()=>{
      this.setPositions();
      this.validateAll();
    });
  }

  setPositions() {
    const el: HTMLElement = this.container.nativeElement;
    const containerRect = el.getBoundingClientRect();
    // THE FIRST CHILD NODE IS A COMMENT, SO START FROM POSITION i=1...
    for (let i = 1; i < el.childNodes.length; i++) {
      const e = el.childNodes[i] as HTMLElement;
      if (e.style && this.items[i - 1]) {
        e.style.left = this.items[i - 1].x / this.normalizeItem + 'px';
        e.style.top = containerRect.height - this.items[i - 1].y / this.normalizeItem - e.getBoundingClientRect().height + 'px';
      }
    }
  }

  download() {
    const data = this.getDataAsString();
    this.utils.downloadFromText('PLT_' + this.pallet.name + '.DAT',data);
  }

  uploadFile() {
    this.uploadInput.nativeElement.click();
  }

  onUploadFilesChange(e: { target: {value: File, files: File[]}}) {
    const reader = new FileReader();
    for (const f of e.target.files) {
      if (!f.name.toUpperCase().endsWith('.DAT')) {
        this.snackbarService.openTipSnackBar('pallets.err_invalid_file');
        break;
      }
      reader.readAsText(f, 'UTF-8');
      reader.onload = evt => {
        this.setDataFromString(reader.result as string, true);
      };
      reader.onerror = evt => {
        console.log('error:');
        console.log(evt);
        this.snackbarService.openTipSnackBar('pallets.err_invalid_file');
      };
    }
    e.target.value = null;
  }

  changeOrder(oldVal: number, newVal: number) {
    this._items[oldVal - 1].order = newVal;
    this._items[newVal - 1].order = oldVal;
    const tmp = this._items[oldVal - 1];
    this._items[oldVal - 1] = this._items[newVal - 1];
    this._items[newVal - 1] = tmp;
    this.changed.emit(this._items.length);
  }
}

export interface CustomPalletItem {
  x: number;
  y: number;
  r: number;
  order: number;
  error: boolean;
  untouched: boolean;
  element: HTMLElement;
}
