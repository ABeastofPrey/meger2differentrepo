import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {NotificationService} from '../../../../modules/core/services/notification.service';
import {ResizeEvent} from 'angular-resizable-element';

@Component({
  selector: 'notification-window',
  templateUrl: './notification-window.component.html',
  styleUrls: ['./notification-window.component.css']
})
export class NotificationWindowComponent implements OnInit {
  
  @ViewChild('wrapper') msgContainer: ElementRef;
  
  style: object = {};
  contextMenuShown : boolean = false;
  contextMenuX : number = 0;
  contextMenuY : number = 0;

  constructor(public notification:NotificationService) { }

  ngOnInit() {
    this.notification.newMessage.subscribe(()=>{
      const objDiv = this.msgContainer.nativeElement;
      objDiv.scrollTop = objDiv.scrollHeight;
    });
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
  
  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      position: 'fixed',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`
    };
  }
  
  onContextMenu(e:MouseEvent) {
    e.preventDefault();
    this.contextMenuX = e.offsetX + 16;
    this.contextMenuY = e.offsetY + 56;
    this.contextMenuShown = true;
  }
  
  onClick() {
    this.contextMenuShown = false;
  }
  
  clear() {
    this.notification.clear();
    this.contextMenuShown = false;
  }

}
