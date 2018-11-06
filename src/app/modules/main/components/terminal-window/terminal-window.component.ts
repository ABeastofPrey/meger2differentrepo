import { Component, OnInit } from '@angular/core';
import {ViewChild} from '@angular/core';
import {ElementRef} from '@angular/core';
import {Output} from '@angular/core';
import {EventEmitter} from '@angular/core';
import {ResizeEvent} from 'angular-resizable-element';

@Component({
  selector: 'terminal-window',
  templateUrl: './terminal-window.component.html',
  styleUrls: ['./terminal-window.component.css']
})
export class TerminalWindowComponent implements OnInit {
  
  @Output('onClose') closeEvent : EventEmitter<any>  = new EventEmitter();
  
  style: object = {};
  contextMenuX : number = 0;
  contextMenuY : number = 0;

  constructor() { }

  ngOnInit() {
  }
  
  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      position: 'fixed',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`
    };
  }
  
  validate(event: ResizeEvent): boolean {
    const MIN_WIDTH: number = 250;
    const MIN_HEIGHT: number = 200;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_WIDTH ||
        event.rectangle.height < MIN_HEIGHT)
    ) {
      return false;
    }
    return true;
  }
  
  onDragEnd(e: any) {
    this.contextMenuX = e.x;
    this.contextMenuY = e.y;
  }
  
  onClose() {
    this.closeEvent.emit();
  }

}
