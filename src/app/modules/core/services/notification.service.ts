import { Injectable, ApplicationRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CSNotification } from '../notification.model';

@Injectable()
export class NotificationService {
  private _notificationWindowOpen = false;
  private _unread = 0;
  private _notifications: CSNotification[] = [];

  newMessage: EventEmitter<void> = new EventEmitter();

  get count() {
    return this._unread;
  }

  get windowOpen() {
    return this._notificationWindowOpen;
  }

  get notifications() {
    let str = '';
    for (const n of this._notifications) str += n.err ? n.err.msg + '\n' : n.msg;
    return str;
  }

  get notificationsAsArray() {
    return this._notifications;
  }

  toggleWindow() {
    this._notificationWindowOpen = !this._notificationWindowOpen;
    this._unread = 0;
  }

  onAsyncMessage(msg: string) {
    this._notifications.push(new CSNotification(msg));
    if (!this.windowOpen) this._unread++;
    this.newMessage.emit();
  }

  clear() {
    this._notifications = [];
    this._unread = 0;
  }

  constructor(private ref: ApplicationRef) {}
}
