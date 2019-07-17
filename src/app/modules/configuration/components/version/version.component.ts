import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { WebsocketService } from '../../../core/services/websocket.service';
import { PageEvent } from '@angular/material';
import { slice, map, range, ifElse, always, then, split, compose, filter, sort, head } from 'ramda';
import { hasNoError, resProp } from '../../../core/services/service-adjunct';
import { MatDialog } from '@angular/material';
import { LicenseDialogComponent } from '../../../../components/license-dialog/license-dialog.component';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { isNotNil } from 'ramda-adjunct';

interface ILib {
    name: string;
    version: string;
    date: string;
    desc: string;
}

const splitWithSemicolon = split(';');

@Component({
    selector: 'app-version',
    templateUrl: './version.component.html',
    styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit {
    public wholeLibs: ILib[] = [];
    public visableLibs: ILib[] = [];
    public guiVer: string = environment.gui_ver;
    public guiDate: string = environment.gui_date;
    public pageSize = 10;
    public mainVer: string[] = [];
    public libVer: string;

    constructor(
        public data: DataService, private ws: WebsocketService,
        private trn: TranslateService, private dialog: MatDialog
    ) { }

    async ngOnInit(): Promise<void> {
        const wordKey: string[] = [
            'version.tpLibName', 'version.palletLibName', 'version.grippersLibName', 'version.payloadsLibName',
            'version.leadByNoseLibName', 'version.ioMappingLibName', 'version.mcuLibName'
        ];
        const [tpV, tpD] = splitWithSemicolon(this.data.TPVersion);
        const [paV, paD] = splitWithSemicolon(this.data.palletLibVer);
        const [gpV, gpD] = splitWithSemicolon(this.data.gripperLibVer);
        const [plV, plD] = splitWithSemicolon(this.data.payloadLibVer);
        const [lyV, lyD] = splitWithSemicolon(this.data.LeadByNoseLibVer);
        const [imV, imD] = splitWithSemicolon(this.data.iomapVer);
        const [muV, muD] = splitWithSemicolon(this.data.mcuVer);
        const descriptions = await this.getDescriptions(wordKey.length + 1);
        const assembleLibs = names => {
            this.wholeLibs = [
                { name: names[wordKey[0]], version: tpV, date: tpD, desc: descriptions[0] },
                { name: names[wordKey[1]], version: paV, date: paD, desc: descriptions[1] },
                { name: names[wordKey[2]], version: gpV, date: gpD, desc: descriptions[2] },
                { name: names[wordKey[3]], version: plV, date: plD, desc: descriptions[3] },
                { name: names[wordKey[4]], version: lyV, date: lyD, desc: descriptions[4] },
                { name: names[wordKey[5]], version: imV, date: imD, desc: descriptions[5] },
                { name: names[wordKey[6]], version: muV, date: muD, desc: descriptions[6] }
            ];
            this.visableLibs = slice(0, this.pageSize)(this.wholeLibs);
        };
        // assemble libraries' information.
        this.trn.get(wordKey).subscribe(assembleLibs);
        // get the main version(Control Studio Version)
        this.mainVer = await this.getMainVersion();
        // get latest lib date as main lib date.
        const dates = [tpD, paD, gpD, plD, lyD, imD, muD];
        const filterNilDate = filter(isNotNil);
        const differ = (a, b) => b - a;
        const sorter = sort(differ);
        const getLatestDate = compose(head, sorter, filterNilDate);
        this.libVer = getLatestDate(dates);
    }

    public clickReleaseNote(): void {
        this.dialog.open(ReleaseNoteComponent, {
          autoFocus: false,
          disableClose: true
        });
    }

    public clickUserLicence(): void {
        this.dialog.open(LicenseDialogComponent, {
          autoFocus: false,
          disableClose: true,
          data: {
              useInKukaAbout: true
          }
        });
    }

    public pageChagne({ pageIndex, pageSize }: PageEvent): void {
        const strIndex = pageIndex * pageSize;
        const endIndex = strIndex + pageSize;
        const getVisLibs = slice(strIndex, endIndex);
        this.visableLibs = getVisLibs(this.wholeLibs);
    }

    private async getDescriptions(count: number): Promise<string[]> {
        const query = idx => this.ws.query(`?i18n_getmessage(${idx})`);
        const promises = map(query, range(1, count));
        const responses = await Promise.all(promises) as string[];
        const resHandler = ifElse(hasNoError, resProp, always(''));
        return map(resHandler, responses);
    }

    private async getMainVersion(): Promise<string[]> {
        const query = () => this.ws.query('?vi_getreleaseversion');
        const logErr = err => { console.log(err); return []; };
        const parser = compose(splitWithSemicolon, resProp);
        const handler = ifElse(hasNoError, parser, logErr);
        return compose(then(handler), query)();
    }
}
