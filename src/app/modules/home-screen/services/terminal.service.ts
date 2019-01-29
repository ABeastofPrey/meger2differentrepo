import { Injectable, EventEmitter } from '@angular/core';
import {MCQueryResponse, WebsocketService} from '../../../modules/core/services/websocket.service';

@Injectable()
export class TerminalService {
  
  cmds: TerminalCommand[] = [];

  public sentCommandEmitter: EventEmitter<string> = new EventEmitter<string>();
  
  send(cmd : string) {
    return this.ws.query(cmd).then((ret:MCQueryResponse)=>{
      this.cmds.push({cmd: cmd, result: ret.result});
    });
  }

  constructor(private ws : WebsocketService) { }

}

export interface TerminalCommand {
  cmd : string;
  result : string;
}
