import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material';
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
  rotation: number = 0;
  normalizePreview: number = 1;
  normalizeItem: number = 1;

  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('upload', { static: false }) uploadInput: ElementRef;

  get items() {
    return this._items;
  }

  private _items: CustomPalletItem[] = [];
  private _order: number = 1;

  constructor(private dialog: MatDialog, private api: ApiService) {}

  showMenu(item: CustomPalletItem) {
    let ref = this.dialog.open(CustomItemMenuComponent, {
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

  refresh() {
    let width = this.pallet.item_size_x;
    let height = this.pallet.item_size_y;
    let max = width > height ? width : height;
    this.normalizePreview = max / 70;
    this.normalizeItem = max / 100;
    let pWidth = this.pallet.pallet_size_x;
    let pHeight = this.pallet.pallet_size_y;
    if (pHeight / 270 > this.normalizeItem) this.normalizeItem = pHeight / 270;
    if (pWidth / 550 > this.normalizeItem) this.normalizeItem = pWidth / 550;
    this.container.nativeElement.style.width =
      pWidth / this.normalizeItem + 'px';
    this.container.nativeElement.style.height =
      pHeight / this.normalizeItem + 'px';
  }

  validate(item: CustomPalletItem) {
    // CALLED AFTER EVERY DRAG
    item.untouched = false;
    let element: HTMLElement = item.element;
    let elementRect = element.getBoundingClientRect();
    let containerRect = (<HTMLElement>(
      this.container.nativeElement
    )).getBoundingClientRect();

    let left = element.getBoundingClientRect().left - containerRect.left;
    let top = element.getBoundingClientRect().top - containerRect.top;
    let width = element.getBoundingClientRect().width;
    let height = element.getBoundingClientRect().height;

    // FIND COORDIANTED OF BOTTOM LEFT CORNER
    let x = left;
    let y = containerRect.bottom - elementRect.bottom;

    // UPDATE ITEM WITH NEW POSITION
    item.x = x * this.normalizeItem;
    item.y = y * this.normalizeItem;

    let error: boolean = false;

    // CHECK BOUNDS
    if (left + width - containerRect.width >= 1 || left < 0) {
      error = true;
      console.log('OBJECT OUTSIDE X');
    } else if (top + height - containerRect.height >= 1 || top < 0) {
      error = true;
      console.log('OBJECT OUTSIDE Y');
    }

    // COMPARE ITEM TO ALL OTHER ITEMS
    for (let other of this._items) {
      if (error) break;
      if (other === item) continue;
      let otherLeft =
        other.element.getBoundingClientRect().left - containerRect.left;
      let otherTop =
        other.element.getBoundingClientRect().top - containerRect.top;
      let otherWidth = other.element.getBoundingClientRect().width;
      let otherHeight = other.element.getBoundingClientRect().height;
      if (
        (otherTop + otherHeight > top && otherTop <= top) ||
        (top + height > otherTop && top <= otherTop)
      ) {
        if (
          otherLeft === left ||
          (otherLeft < left && otherLeft + otherWidth > left + epsilon) ||
          (otherLeft > left && left + width > otherLeft + epsilon)
        ) {
          error = true;
          console.log(otherTop, otherHeight, top, height);
          console.log(otherLeft, left, otherWidth, width);
        }
      }
    }
    item.error = error;
    this.changed.emit(this._items.length);
  }

  ngOnInit() {
    this.refresh();
  }

  onPalletInfoLoaded() {
    if (this.pallet.dataFile) {
      return this.api.getFile(this.pallet.dataFile).then(content => {
        this.setDataFromString(content);
      });
    }
    return Promise.resolve(null);
  }

  rotate() {
    this.rotation += 90;
    if (this.rotation === 360) this.rotation = 0;
  }

  addItem() {
    const isFirst = this._items.length === 0;
    this._items.push({
      x: 0,
      y: 0,
      r: this.rotation,
      order: this._order++,
      error: false,
      element: null,
      untouched: !isFirst,
    });
    this.changed.emit(this._items.length);
  }

  removeItem(index: number) {
    this._items.splice(index, 1);
    for (let i = index; i < this._items.length; i++) this._items[i].order--;
    this._order--;
    this.changed.emit(this._items.length);
  }

  getDataAsString(): string {
    let result = '';
    for (let item of this._items) {
      result +=
        Math.round(item.x) + ',' + Math.round(item.y) + ',' + item.r + '\n';
    }
    return result;
  }

  private setDataFromString(str: string) {
    let containerRect = (<HTMLElement>(
      this.container.nativeElement
    )).getBoundingClientRect();
    let lines = str.split('\n');
    let items: CustomPalletItem[] = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.indexOf('---') >= 0) break;
      let parts = line.split(',');
      if (parts.length !== 3) continue;
      let x = Number(parts[0]);
      let y = Number(parts[1]);
      let r = Number(parts[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
        items.push({
          x: x,
          y: y,
          r: r,
          order: i + 1,
          error: false,
          element: null,
          untouched: false,
        });
      }
    }
    this._items = items;
    this._order = items.length + 1;
    this.changed.emit(this._items.length);
    setTimeout(() => {
      // FIX POSITIONS
      // THE FIRST CHILD NODE IS A COMMENT, SO START FROM POSITION i=1...
      for (let i = 1; i < this.container.nativeElement.childNodes.length; i++) {
        let e = <HTMLElement>this.container.nativeElement.childNodes[i];
        if (e.style && this.items[i - 1]) {
          e.style.left = this.items[i - 1].x / this.normalizeItem + 'px';
          e.style.top =
            containerRect.height -
            this.items[i - 1].y / this.normalizeItem -
            e.getBoundingClientRect().height +
            'px';
        }
      }
    }, 200);
  }

  download() {
    let data = this.getDataAsString();
    //this.api.downloadFromText('PLT_' + this.pallet.name + '.DAT',data);
  }

  uploadFile() {
    this.uploadInput.nativeElement.click();
  }

  onUploadFilesChange(e: any) {
    let reader = new FileReader();
    for (let f of e.target.files) {
      reader.readAsText(f, 'UTF-8');
      reader.onload = evt => {
        this.setDataFromString(<string>reader.result);
      };
      reader.onerror = evt => {
        console.log('error:');
        console.log(evt);
      };
    }
    e.target.value = null;
  }

  changeOrder(oldVal: number, newVal: number) {
    this._items[oldVal - 1].order = newVal;
    this._items[newVal - 1].order = oldVal;
    let tmp = this._items[oldVal - 1];
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
