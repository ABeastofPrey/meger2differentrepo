import { IniNode } from './../../configuration/components/configuration/model/configuration.model';
import { ApiService } from './../../core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { SafetyConfiguration } from '../../configuration/components/configuration/model/configuration.model';

@Component({
  selector: 'app-safety-configurator',
  templateUrl: './safety-configurator.component.html',
  styleUrls: ['./safety-configurator.component.css']
})
export class SafetyConfiguratorComponent implements OnInit {

  conf: SafetyConfiguration;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.ready.subscribe(stat=>{
      if (stat) {
        this.init();
      }
    });
  }

  private async init() {
    const data = await this.api.iniToJson('DEMO.INI');
    if (!data) return;
    this.conf = new SafetyConfiguration(data as IniNode[]);
  }

}
