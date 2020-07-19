import { takeUntil } from 'rxjs/operators';
import { ScreenManagerService } from './../../../core/services/screen-manager.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  ProjectManagerService,
  WebsocketService,
  MCQueryResponse,
  DataService,
} from '../../../core';
import { App } from '../../../core/models/project/mc-project.model';
import { MatSelectChange } from '@angular/material';
import { Subject } from 'rxjs';

@Component({
  selector: 'program-settings',
  templateUrl: './program-settings.component.html',
  styleUrls: ['./program-settings.component.css'],
})
export class ProgramSettingsComponent implements OnInit {

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public prj: ProjectManagerService,
    public dataService: DataService,
    private ws: WebsocketService,
    private mgr: ScreenManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.prj.onAppStatusChange.pipe(takeUntil(this.notifier)).subscribe(stat=>{
      if (this.prj.activeProject) {
        this.router.navigateByUrl('/projects');
      }
    });
    this.mgr.projectActiveStatusChange.pipe(takeUntil(this.notifier)).subscribe(stat=>{
      if (stat) {
        this.router.navigateByUrl('/projects');
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  busy = false;

  percentageLabel(num: number) {
    return num + '%';
  }

  toggleActiveApp(app: App, changeType: string) {
    this.prj.stopStatusRefresh();
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
          return this.prj.refreshAppList(this.prj.currProject.value, true);
        }
        if (changeType === 'active') app.active = !app.active;
        else app.cyclic = !app.cyclic;
        this.prj.getProjectStatus();
      });
  }

  toggleAllApps() {
    this.busy = true;
    for (const app of this.prj.currProject.value.apps) {
      app.active = this.isAllAppsSelected ? true : false; // so that toggle will set it in the next step
      this.toggleActiveApp(app, 'active');
    }
    this.busy = false;
  }

  get isAllAppsSelected() {
    return this.prj.currProject.value.apps.every(a=>a.active);
  }

  get isSomeAppsSelected() {
    return this.prj.currProject.value.apps.some(a=>a.active);
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
