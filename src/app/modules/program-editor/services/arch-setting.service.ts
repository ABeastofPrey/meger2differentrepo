import { ArchApi } from './arch-setting.constants';
import { Injectable } from '@angular/core';
import {
  WebsocketService,
  MCQueryResponse,
} from '../../../modules/core/services/websocket.service';
import { ArchElement } from '../components/program-settings/arch-setting/arch-setting.component';
import { ErrorFrame } from '../../core/models/error-frame.model';

@Injectable()
export class ArchSettingService {
  constructor(private ws: WebsocketService) {}

  getInitTable(): Promise<ErrorFrame | ArchElement[]> {
    return this.queryWithApi(`${ArchApi.JP_getTable}`);
  }

  resetTable(): Promise<ErrorFrame | ArchElement[]> {
    return this.queryWithApi(`${ArchApi.JP_reset}`);
  }

  /**
   * Query setArch api.
   *
   * @param {number} index arch elememt index.
   * @param {(1 | 2)} departOrApproach 1 means that the changed value of arch item was departZ, 2 means approcahZ.
   * @param {number} value the changed value of specfic arch item.
   * @returns {(Promise<ErrorFrame | Array<ArchElement>>)}
   * @memberof ArchSettingService
   */
  setArch(
    index: number,
    departOrApproach: 1 | 2,
    value: number
  ): Promise<ErrorFrame | ArchElement[]> {
    return this.queryWithApi(
      `${ArchApi.JP_setArch}("ARCH","${index},${departOrApproach}", "${value}")`
    );
  }

  private queryWithApi(
    queryStr: string
  ): Promise<ErrorFrame | ArchElement[]> {
    return new Promise((resolve, reject) => {
      this.ws.query(queryStr).then((res: MCQueryResponse) => {
        return res && res.err
          ? reject(res.err)
          : resolve(res.result && JSON.parse(res.result));
      });
    });
  }
}
