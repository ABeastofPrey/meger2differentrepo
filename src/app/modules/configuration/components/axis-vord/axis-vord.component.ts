import { MatSnackBar } from '@angular/material';
import { GroupManagerService } from './../../../core/services/group-manager.service';
import { WebsocketService, MCQueryResponse } from './../../../core/services/websocket.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {UtilsService} from '../../../../modules/core/services/utils.service';
@Component({
  selector: 'app-axis-vord',
  templateUrl: './axis-vord.component.html',
  styleUrls: ['./axis-vord.component.css']
})
export class AxisVordComponent implements OnInit {

  vords: Vord[] = [];
  initDone = false;
  enabled = false;

  private words: {};

  constructor(
    private ws: WebsocketService,
    private grp: GroupManagerService,
    private snack: MatSnackBar,
    private trn: TranslateService,
    private utils: UtilsService
  ) { }

  async ngOnInit() {
    this.words = await this.trn.get(['changeOK']).toPromise();
    this.ws.query('?Mpar_get_Enable').then((ret: MCQueryResponse) => {
      this.enabled = ret.result === '1';
    });
    this.grp.groupsLoaded.subscribe(val => {
      if (!val) return;
      const g = this.grp.groups[0].name;
      const cmd = '?Mpar_Get_Setup_Values(' + g + ')';
      this.ws.query(cmd).then(async (ret: MCQueryResponse) => {
        if (ret.err) return;
        this.vords = ret.result.split(',').map(ax => {
          const parts = ax.split(':');
          return new Vord(parts[0], parts[1]);
        });
        for (const ax of this.vords) {
          await ax.init(this.ws);
        }
        this.initDone = true;
      });
    });
  }

  async onEnableToggle(val: boolean) {
    const cmd = '?Mpar_Set_Enable(1,' + (val ? '"Override"' : '"Setup"') + ')';
    const result = await this.ws.query(cmd) as MCQueryResponse;
    if (result.result !== '0') {
      this.enabled = !val;
    }
  }

  onVordChange(i: number, val: number) {
    const ax = this.vords[i].name;
    const prev = this.vords[i].vord;
    this.vords[i].vord = val;
    const cmd = `?Mpar_Set_Overide(${ax},${val})`;
    this.ws.query(cmd).then(ret => {
      if (ret.result !== '0') {
        this.vords[i].vord = prev;
      } else {
        if (!this.utils.IsKuka) {
          this.snack.open(this.words['changeOK'], '', {duration: 1500});
        }
      }
    });
  }

}

class Vord {

  name: string;
  original: number;
  vord: number;


  constructor(name: string, vel: string) {
    this.name = name;
    this.original = Number(vel);
    this.vord = 0;
  }

  async init(ws: WebsocketService) {
    const cmd = '?Mpar_Get_Overide(' + this.name + ')';
    return ws.query(cmd).then((ret: MCQueryResponse) => {
      this.vord = Number(ret.result);
    });
  }
}
