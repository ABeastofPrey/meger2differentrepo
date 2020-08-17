import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PluginService } from '../../services/plugin.service';

@Component({
    selector: 'program-plugin',
    templateUrl: './plugin.component.html',
    styleUrls: ['./plugin.component.scss']
})
export class PluginComponent implements OnInit {

    constructor(private activatedRoute: ActivatedRoute, private ps: PluginService) { }

    ngOnInit() {
        const pluginPos = document.getElementById("pluginPos");
        pluginPos.innerHTML = '';
        this.activatedRoute.queryParams.subscribe(
            params => {
                const plugin = document.createElement(params['component']);
                pluginPos.appendChild(plugin);
                // this.ps.sendCustomEvent("changeProject",{"className":"pluginSelected"});
            }
        );
    }

}
