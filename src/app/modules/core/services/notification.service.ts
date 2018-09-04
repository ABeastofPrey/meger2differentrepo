import { Injectable, ApplicationRef } from '@angular/core';
import {EventEmitter} from '@angular/core';

@Injectable()
export class NotificationService {
  
  private _notificationWindowOpen : boolean = false;
  private _unread : number = 0;
  private _notifications : string[] = [];
  
  newMessage: EventEmitter<any> = new EventEmitter();
  
  get count() {
    return this._unread;
  }
  
  get windowOpen() {
    return this._notificationWindowOpen;
  }
  
  get notifications() {
    return this._notifications.join('');
  }
  
  toggleWindow() {
    this._notificationWindowOpen = !this._notificationWindowOpen;
    this._unread = 0;
  }
  
  onAsyncMessage(msg:string) {
    this._notifications.push(msg);
    if (!this.windowOpen)
      this._unread++;
    this.ref.tick();
    this.newMessage.emit();
  }
  
  clear() {
    this._notifications = [];
    this._unread = 0;
  }
  

  constructor(private ref: ApplicationRef) { }

}
