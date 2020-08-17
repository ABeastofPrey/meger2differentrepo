import { ErrorFrame } from './models/error-frame.model';

export class CSNotification {

  err: ErrorFrame;
  msg: string;

  constructor(msg: string) {
    if (msg.startsWith('Error:')) this.err = new ErrorFrame(msg);
    else this.msg = msg;
  }

}

export enum LibAsyncMessageCode {
  MaitenanceNewLog = 1001,
  PluginInstallingLog = 1002
}

export interface LibAsyncMessage {
  code: LibAsyncMessageCode,
  hasErr: boolean,
  result: string,
  error: string,
}
