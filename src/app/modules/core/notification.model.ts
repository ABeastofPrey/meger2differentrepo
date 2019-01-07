import {ErrorFrame} from "./models/error-frame.model";

export class CSNotification {
  err: ErrorFrame;
  msg: string;
  
  constructor(msg: string) {
    if (msg.startsWith('Error:'))
      this.err = new ErrorFrame(msg);
    else
      this.msg = msg;
  }
}