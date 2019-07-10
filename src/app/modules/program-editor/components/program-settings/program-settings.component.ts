import { Component, OnInit } from '@angular/core';
import {
  ProjectManagerService,
  WebsocketService,
  MCQueryResponse,
  DataService,
} from '../../../core';
import { App } from '../../../core/models/project/mc-project.model';
import { MatSelectChange } from '@angular/material';

@Component({
  selector: 'program-settings',
  templateUrl: './program-settings.component.html',
  styleUrls: ['./program-settings.component.css'],
})
export class ProgramSettingsComponent implements OnInit {
  constructor(
    public prj: ProjectManagerService,
    public dataService: DataService,
    private ws: WebsocketService
  ) {}

  ngOnInit() {}

  toggleActiveApp(app: App, changeType: string) {
    const proj = this.prj.currProject.value.name;
    const newStatus =
      changeType === 'active'
        ? (app.active ? '0' : '1') + ',' + app.cyclic
        : app.active + ',' + (app.cyclic ? '0' : '1');
    this.ws
      .query(
        '?prj_set_app_enable("' +
          proj +
          '","' +
          app.name +
          '",' +
          newStatus +
          ')'
      )
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0' || ret.err) {
          this.prj.refreshAppList(this.prj.currProject.value, true);
          return;
        }
        if (changeType === 'active') app.active = !app.active;
        else app.cyclic = !app.cyclic;
      });
  }

  updateAppId(app: App, e: MatSelectChange) {
    const old = app.id;
    app.id = e.value;
    this.ws
      .query('?tp_set_app_name(' + e.value + ',"' + app.name + '")')
      .then((ret: MCQueryResponse) => {
        if (ret.result !== '0') app.id = old;
      });
  }
}
