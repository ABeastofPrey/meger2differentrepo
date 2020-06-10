import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, map as rxjsMap } from 'rxjs/operators';
import { split, compose, map, last, trim, always, sortBy, prop } from 'ramda';
import { environment } from '../../../../environments/environment';
import { WebsocketService } from '../../core/services/websocket.service';
import { DataService } from '../../core';
// tslint:disable-next-line: interface-name
interface ILib {
    name: string;
    version: string;
    date: string;
    desc: string;
}

// tslint:disable-next-line: interface-name
interface IResLibs {
    name: string;
    ver: string;
    desc: string;
}

export interface ModuleVersion {
    moduleName: string,
    moduleVern: string,
    versonDate: string,
}

export interface MainModuleVersion {
    csVersion: ModuleVersion,
    mcVersion: ModuleVersion,
    uiVersion: ModuleVersion,
    webserverVersion: ModuleVersion,
    mainLibryVersion: ModuleVersion
}

const getVersion = moduleName => ([moduleVern, versonDate]): ModuleVersion => ({
    moduleName, moduleVern, versonDate
});

@Injectable({
    providedIn: 'root'
})
export class ModuleVersionService {
    constructor(private webService: WebsocketService, private dataService: DataService) { }

    public getModuleVersion(): Observable<MainModuleVersion> {
        const queries = [
            this.getCSVersion(), this.getMCVersion(),
            this.getUIVersion(), this.getWebServerVersion(),
            this.getMainLibryVersion()
        ];
        return combineLatest(queries).pipe(
            rxjsMap(([csVersion, mcVersion, uiVersion, webserverVersion, mainLibryVersion]) => ({
                csVersion,
                mcVersion,
                uiVersion,
                webserverVersion,
                mainLibryVersion
            }))
        );
    }

    public getCSVersion(): Observable<ModuleVersion> {
        const api = '?vi_getreleaseversion';
        const getCSVersion = getVersion(environment.appName_Kuka);
        return this.webService.simpleQuery(api).pipe(
            rxjsMap(split(';')),
            rxjsMap(getCSVersion)
        );
    }

    public getMCVersion(): Observable<ModuleVersion> {
        const convertVer = compose(map(compose(trim, last, split('='))), split(','));
        const getMCVersion = getVersion('softMC');
        return of(this.dataService.MCVersion).pipe(rxjsMap(compose(getMCVersion, convertVer)));
    }

    public getUIVersion(): Observable<ModuleVersion> {
        const getUIVersion = getVersion('GUI');
        return of(environment.gui_ver).pipe(
            rxjsMap(split(' ')),
            rxjsMap(getUIVersion)
        );
    }

    public getWebServerVersion(): Observable<ModuleVersion> {
        const getWSVersion = getVersion('Web Server');
        return of(this.dataService.WebServerInfo).pipe(rxjsMap(getWSVersion));
    }

    public getMainLibryVersion(): Observable<ModuleVersion> {
        const api = '?VI_getLibraryVersion';
        const getLibVersion = getVersion('Library');
        const moduleVern = this.dataService.cabinetVer;
        const convertLib = (x: IResLibs): ILib => ({
            name: x.name,
            version: split(';')(x.ver)[0],
            date: split(';')(x.ver)[1],
            desc: x.desc
        });
        return this.webService.simpleQuery(api).pipe(
            rxjsMap((res: string) => JSON.parse(res)),
            rxjsMap(map(convertLib)),
            rxjsMap(sortBy(prop('date'))),
            rxjsMap(compose(prop('date'), last)),
            catchError(always(of('')))
        ).pipe(
            rxjsMap(date => getLibVersion([moduleVern, date]))
        );
    }

}
