import { Injectable } from '@angular/core';
import { WebsocketService, ProgramEditorService } from '../../core';
import { Observable } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';
import { isNotUndefined } from 'ramda-adjunct';

export interface PluginWebcomponent {
    componentName: string,
    host: string[],
    props: string[],
    methods: string[],
    routerPlugin: string
}

export interface PluginInfo {
    name: string,
    discription: string[],
    author: string,
    version: string,
    installDate: string,
    libs: string[],
    scripts: string[],
    csDependency: string,
    pluginDependency: string[],
    projectFolder: string,
    webComponents: PluginWebcomponent[],
    keyWords: string[]
}

export interface InstalledPluginInfo {
    number: string,
    installedPlugins: PluginInfo[]
}

@Injectable({ providedIn: 'root' })
export class PluginService {

    constructor(
        private ws: WebsocketService,
        public service: ProgramEditorService
    ) { }

    public getInstalledPluginScripts(): Observable<string[]> {
        const getScripts = (plugins: PluginInfo[]) => plugins.reduce((acc, p) => [...acc, ...p.scripts], []);
        return this.getInstalledPlugins().pipe(map(getScripts));
    }

    public getInstalledPlugins(): Observable<PluginInfo[]> {
        const getPlugins = (info: InstalledPluginInfo) => isNotUndefined(info.installedPlugins) ? info.installedPlugins : [];
        return this.getInstalledPluginInfo().pipe(map(getPlugins));
    }

    public getInstalledPluginInfo(): Observable<InstalledPluginInfo> {
        const checkConnection = (connected: boolean) => {
            if (!connected) {
                console.log('Get installed plugin script failed, websocket is not connected.');
            }
            return connected;
        };
        const query = () => this.ws.simpleQuery('?PLUG_GET_CONFIG_INFO');
        const parser = (res: string) => JSON.parse(res);
        return this.ws.isConnected.pipe(
            filter(checkConnection),
            switchMap(query),
            map(parser)
        );
    }

    public appendScriptsToBody(scripts: string[]): void {
        try {
            for (let scriptName of scripts) {
                const script = document.createElement("script");
                script.src = `assets/plugin/${scriptName}`;
                document.body.appendChild(script);
            }
        } catch (e) {
            console.warn(e);
        }
    }

    public appendScriptToBody(name: string): void {
        try {
            const script = document.createElement("script");
            script.src = `assets/plugin${name}`;
            document.appendChild(script);
        } catch (error) {
            console.warn(error);
        }
    }

    public pluginPlace(id: string, callback?) {
        this.ws.query("?PLUG_GET_CONFIG_INFO").then((result) => {
            const installedPlugins = JSON.parse(result.result).installedPlugins;
            installedPlugins.forEach(element => {
                element.webComponents.forEach(component => {
                    component.host.forEach((host) => {
                        if (host === id) {
                            const pluginPos = document.getElementById(id);
                            const plugin = document.createElement(component.componentName);
                            pluginPos.appendChild(plugin);
                            if (id === "plugin") {
                                plugin.onclick = () => {
                                    callback && callback(component.routerPlugin);
                                }
                            }else if (id === "command") {
                                callback();
                            }
                        }
                    })
                });
            });

        })
    }

    public sendCustomEvent(name, value) {
        document.dispatchEvent(new CustomEvent(name, {
            "detail": value
        }));
    }

}
