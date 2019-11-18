import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { WebsocketService, MCQueryResponse } from '../../../core/services/websocket.service';
import { PageEvent } from '@angular/material';
import {
  slice,
  map,
  ifElse,
  then,
  split,
  compose,
  filter,
  sort,
  head,
} from 'ramda';
import { hasNoError, resProp } from '../../../core/services/service-adjunct';
import { MatDialog } from '@angular/material';
import { LicenseDialogComponent } from '../../../../components/license-dialog/license-dialog.component';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { isNotNil } from 'ramda-adjunct';

import { map as rxjsMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

interface ILib {
  name: string;
  version: string;
  date: string;
  desc: string;
}

interface IResLibs {
  name: string;
  ver: string;
  desc: string;
}

const splitWithSemicolon = split(';');
const splitWithSpace = split(' ');

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
})
export class VersionComponent implements OnInit {
  public wholeLibs: ILib[] = [];
  public visableLibs: ILib[] = [];
  public guiVer: string = splitWithSpace(environment.gui_ver);
  public appNameKuka: string = environment.appName_Kuka;
  public pageSize = 10;
  public mainVer: string[] = [];
  public libVer: string;

  constructor(
    public data: DataService,
    private ws: WebsocketService,
    private trn: TranslateService,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    this.wholeLibs = await this.getLibDescriptions();
    this.visableLibs = slice(0, this.pageSize)(this.wholeLibs);
    // get the main version(Control Studio Version)
    this.mainVer = await this.getMainVersion();
    // get latest lib date as main lib date.
    const getDate = (x: ILib) => x.date;
    const dates = map(getDate, this.wholeLibs);
    const filterNilDate = filter(isNotNil);
    const differ = (a, b) => b - a;
    const sorter = sort(differ);
    const getLatestDate = compose(head, sorter, filterNilDate);
    this.libVer = getLatestDate(dates);

    const que = '?VI_getLibraryVersion';
    this.ws.observableQuery(que)
      .pipe(rxjsMap((res: MCQueryResponse) => JSON.parse(res.result)), catchError((err: any) => throwError(err.errMsg)))
      .subscribe(res => console.log(res), err => console.warn(err));
  }

  public clickReleaseNote(): void {
    this.dialog.open(ReleaseNoteComponent, { autoFocus: false, disableClose: true, });
  }

  public clickUserLicence(): void {
    const options = {
      autoFocus: false,
      disableClose: true,
      width: '90%',
      data: {
        useInKukaAbout: true,
      },
    };
    this.dialog.open(LicenseDialogComponent, options);
  }

  public pageChagne({ pageIndex, pageSize }: PageEvent): void {
    const strIndex = pageIndex * pageSize;
    const endIndex = strIndex + pageSize;
    const getVisLibs = slice(strIndex, endIndex);
    this.visableLibs = getVisLibs(this.wholeLibs);
  }

  private async getLibDescriptions(): Promise<ILib[]> {
    const query = () => this.ws.query('?VI_getLibraryVersion');
    const leftHandler = err => {
      console.warn(err);
      return [];
    };
    const splitVerDate = (x: IResLibs) => Object({
      name: x.name,
      version: splitWithSemicolon(x.ver)[0],
      date: splitWithSemicolon(x.ver)[1],
      desc: x.desc
    }) as ILib;
    const rightHandler = compose(map(splitVerDate), JSON.parse, resProp);
    const resHandler = ifElse(hasNoError, rightHandler, leftHandler);
    return compose(then(resHandler), query)();
  }

  private async getMainVersion(): Promise<string[]> {
    const query = () => this.ws.query('?vi_getreleaseversion');
    const logErr = err => {
      console.log(err);
      return [];
    };
    const parser = compose(splitWithSemicolon, resProp);
    const handler = ifElse(hasNoError, parser, logErr);
    return compose(then(handler), query)();
  }
}
