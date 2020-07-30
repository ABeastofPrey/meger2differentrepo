import {
  Directive,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CustomPalletItem } from '../components/pallet-level-designer/pallet-level-designer.component';

declare var $;

@Directive({
  selector: '[draggableItem]',
})
export class DraggableItemDirective {
  private _time: number;

  @Input() draggableItem: CustomPalletItem;
  @Output() shortclick: EventEmitter<void> = new EventEmitter();
  @Output() dragEnd: EventEmitter<void> = new EventEmitter();

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    $(this.el.nativeElement).draggable({
      containment: 'parent',
      snap: true,
      stop: () => {
        this.dragEnd.emit();
      },
      stack: '.container div',
    });
    this.el.nativeElement.style.zIndex = this.draggableItem.order;
    this.draggableItem.element = this.el.nativeElement;
  }

  @HostListener('mousedown')
  onMouseDown() {
    this._time = new Date().getTime();
  }

  @HostListener('mouseup')
  onMouseUp() {
    const diff = new Date().getTime() - this._time;
    if (diff < 200) this.shortclick.emit();
  }
}
