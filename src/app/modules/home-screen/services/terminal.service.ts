import { Injectable, EventEmitter } from '@angular/core';
import {
  MCQueryResponse,
  WebsocketService,
} from '../../../modules/core/services/websocket.service';

@Injectable()
export class TerminalService {
  cmds: TerminalCommand[] = [];
  history: string[] = [];
  public sentCommandEmitter: EventEmitter<string> = new EventEmitter<string>();

  public onNewCommand: EventEmitter<TerminalCommand> = new EventEmitter<
    TerminalCommand
  >();

  send(cmd: string) {
    return this.ws.query(cmd).then((ret: MCQueryResponse) => {
      const terminalCommand = { cmd: cmd, result: ret.result };
      this.cmds.push(terminalCommand);
      this.history.push(cmd);
      this.onNewCommand.emit(terminalCommand);
    });
  }

  get cmdsAsString(): string {
    const sep = '--> ';
    if (this.cmds.length === 0) return '';
    return (
      sep +
      this.cmds
        .map(cmd => {
          return cmd.cmd + (cmd.result.length > 0 ? '\n' + cmd.result : '');
        })
        .join('\n' + sep)
    );
  }

  constructor(private ws: WebsocketService) {}

  clear() {
    this.cmds = [];
    this.onNewCommand.emit(null);
  }
}

export interface TerminalCommand {
  cmd: string;
  result: string;
}
