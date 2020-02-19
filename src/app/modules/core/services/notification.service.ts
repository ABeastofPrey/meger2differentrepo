import { BehaviorSubject } from 'rxjs';
import { Injectable, ApplicationRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CSNotification } from '../notification.model';

@Injectable()
export class NotificationService {

  notificationsLimit = 999; // MAYBE WE'LL LET THE USER DEFINE THIS IN THE FUTURE

  private _notificationWindowOpen = false;
  private _notifications: CSNotification[] = [];
  private _count = 0; // counts total messages
  private _messagesShowing = false;

  newMessage: EventEmitter<void> = new EventEmitter();
  count: BehaviorSubject<number> = new BehaviorSubject(0); // counts unread messages

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

  toggleWindow() { // toggle notifications window
    this._notificationWindowOpen = !this._notificationWindowOpen;
    this.toggleMessagesShowing(false);
  }

  get messagesShowing() {
    return this._messagesShowing;
  }

  toggleMessagesShowing(byUser: boolean) {
    this._messagesShowing = !this._messagesShowing;
    this.clearUnread();
    if (byUser && this._notificationWindowOpen) {
      this._notificationWindowOpen = false;
    }
  }

  onAsyncMessage(msg: string) {
    const not = new CSNotification(msg);
    if (this._count === this.notificationsLimit) {
      this._notifications.splice(0,this.notificationsLimit/2);
      this._count = this.notificationsLimit / 2;
    } else {
      this._count++;
    }
    this._notifications = this._notifications.concat([not]);
    if (!this.messagesShowing) this.count.next(Math.min(this.count.value + 1,this.notificationsLimit));
    setTimeout(()=>{ // TO AVOID PERFORMANCE ISSUES
      this.newMessage.next();
    },0);
  }

  clear() {
    this._notifications = [];
    this._count = 0;
    this.clearUnread();
    this.count.next(0);
    this.newMessage.next();
  }

  clearUnread() {
    this.count.next(0);
  }

  constructor(private ref: ApplicationRef) {}
}
