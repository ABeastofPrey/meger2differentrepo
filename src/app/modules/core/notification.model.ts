import { ErrorFrame } from './models/error-frame.model';

export class CSNotification {
  err: ErrorFrame;
  msg: string;

  constructor(msg: string) {
    msg = msg.replace(/[\n]+/g, '');
    if (msg.startsWith('Error:')) this.err = new ErrorFrame(msg);
    else this.msg = msg;
  }
}
