import { Component, OnInit } from '@angular/core';
import {ProjectManagerService, WebsocketService, MCQueryResponse, DataService} from '../../../core';
import {App} from '../../../core/models/project/mc-project.model';

@Component({
  selector: 'program-settings',
  templateUrl: './program-settings.component.html',
  styleUrls: ['./program-settings.component.css']
})
export class ProgramSettingsComponent implements OnInit {

  constructor(
    public prj: ProjectManagerService,
    public dataService: DataService,
    private ws: WebsocketService
  ) { }

  ngOnInit() {
  }
  
  toggleActiveApp(app: App) {
    const proj = this.prj.currProject.value.name;
    const newStatus = app.active ? '0' : '1';
    this.ws.query('?prj_set_app_enable("'+proj+'","'+app.name+'",'+newStatus+')')
    .then((ret:MCQueryResponse)=>{
      if (ret.result !== '0' || ret.err)
        return;
      app.active = !app.active;
    });
  }

}
