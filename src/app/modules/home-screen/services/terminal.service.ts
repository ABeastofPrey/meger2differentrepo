import { Injectable, EventEmitter } from '@angular/core';
import {
  MCQueryResponse,
  WebsocketService,
} from '../../../modules/core/services/websocket.service';
import { TranslateService } from '@ngx-translate/core';

export const SEP = '-->';
const LIMIT = 20000;

export const splitLibMsg = (oriMsg: string): string[] => {
  const strIdx = oriMsg.indexOf('"') + 1;
  const endIdx = oriMsg.slice(strIdx).indexOf('"');
  const firstPortion = oriMsg.slice(0, strIdx);
  const secondPortion = oriMsg.slice(strIdx, strIdx + endIdx);
  const thirdPortioin = oriMsg.slice(strIdx + endIdx);
  return [firstPortion, secondPortion, thirdPortioin]
}

export const getLogCode = (msg: string) => {
  const strIdx = msg.indexOf(':') + 1;
  const endIdx = msg.indexOf(',');
  const logCode = parseInt(msg.slice(strIdx, endIdx).trim());
  return logCode;
}

export const isLibLog = (errCode: number) => errCode >= 20000 && errCode <= 20999;

@Injectable()
export class TerminalService {
  
  cmds: TerminalCommand[] = [];
  history: string[] = [];
  sentCommandEmitter: EventEmitter<string> = new EventEmitter<string>();
  resizeRequired: EventEmitter<void> = new EventEmitter<void>();

  onNewCommand: EventEmitter<TerminalCommand> = new EventEmitter<TerminalCommand>();

  send(cmd: string) {
    return this.ws.query(cmd).then(async(ret: MCQueryResponse) => {
      const errCode = getLogCode(ret.result);
      const [firstPortion, secondPortion, thirdPortion] = isLibLog(errCode) ? splitLibMsg(ret.result) : ['', '', ''];
      const terminalCommand = { cmd, result: ret.result.replace(/[\r]+/g, ''), para: secondPortion, firstPortion, thirdPortion };
      const [newCommand] = await this.getTranslationOfLibLogCmd([terminalCommand]);
      this.cmds.push(newCommand);
      this.history.push(cmd);
      this.onNewCommand.emit(newCommand);
      return newCommand;
    });
  }

  async cmdsAsString(): Promise<string> {
    if (this.cmds.length === 0) return '';
    this.cmds = await this.getTranslationOfLibLogCmd(this.cmds);
    const ret = (SEP + this.cmds.map(cmd => {
      return cmd.cmd + (cmd.result.length > 0 ? '\n' + cmd.result : '');
    }).join('\n' + SEP));
    // const len = ret.length;
    // if (len > LIMIT) {
    //   return ret.substring(len-LIMIT);
    // }
    return ret;
  }

  private async getTranslationOfLibLogCmd(cmds: TerminalCommand[]): Promise<TerminalCommand[]> {
    return new Promise(async resolve => {
      for (let cmd of cmds) {
        const logCode = getLogCode(cmd.result);
        if (isLibLog(logCode)) {
          const key = `lib_code.${logCode}`;
          let translation = (await this.trn.get([key]).toPromise())[key];
          cmd.result = `${cmd.firstPortion}${translation}${cmd.para ? ' ' + cmd.para : ''}${cmd.thirdPortion}`;
        }
      }
      resolve([...cmds]);
    });
  }

  constructor(private ws: WebsocketService, private trn: TranslateService,) {}

  clear() {
    this.cmds = [];
    this.onNewCommand.emit();
  }
}

export interface TerminalCommand {
  cmd: string;
  result: string;
  para: string;
  firstPortion: string,
  thirdPortion: string,
}
