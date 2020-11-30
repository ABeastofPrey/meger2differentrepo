import { Component, OnInit } from '@angular/core';
import { SysIO } from '../../../../../../../src/app/modules/gripper-screen/components/gripper-screen/gripper-screen.component';
import { ApiService, TpStatService, UtilsService, WebsocketService } from '../../../../../../../src/app/modules/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { SysLogSnackBarService } from '../../../../../../../src/app/modules/sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'app-remote-io',
  templateUrl: './remote-io.component.html',
  styleUrls: ['./remote-io.component.css']
})
export class RemoteIoComponent implements OnInit {

  private _busy = false;
  get busy() { return this._busy; }

  private _inputs: SysIO[];
  get inputs() { return this._inputs; }

  private _outputs: SysIO[];
  get outputs() { return this._outputs; }

  private _list: AssociationList;
  get list() { return this._list; }

  constructor(
    private ws: WebsocketService,
    private api: ApiService,
    public utils: UtilsService,
    public stat: TpStatService,
    private snackbarService: SysLogSnackBarService
  ) { }

  ngOnInit() {
    this.init();
  }

  private async init() {
    await this.refreshDeviceList();
    await this.refreshIO();
    await this.refreshDropDown();
  }

  private async refreshDropDown() {
    let ret = await this.ws.query('? IOMAP_GET_DROPDOWN_LIST("inputs")');
    if (!ret.err) {
      try {
        this._inputs = JSON.parse(ret.result) as SysIO[];
      } catch (err) {
      }
    }
    ret = await this.ws.query('? IOMAP_GET_DROPDOWN_LIST("outputs")');
    if (!ret.err) {
      try {
        this._outputs = JSON.parse(ret.result) as SysIO[];
      } catch (err) {
      }
    }
  }

  private async refreshIO() {
    const ret = await this.ws.query('?RMT_GET_ASSOCIATION_LIST');
    if (ret.err) return;
    try {
      this._list = JSON.parse(ret.result) as AssociationList;
    } catch (err) {
      return;
    }
  }

  private async refreshDeviceList() {
    const ret = await this.ws.query('?RMT_GET_DEVICES_LIST');
    if (ret.err) return false;
    try {
      // TODO: In the future, display the list and refresh the data when it's changed.
    } catch (err) {
      return false;
    }
    return true;
  }
  
  async getDefault(isInputs: boolean) {
    this._busy = true;
    const api = `?RMT_SET_DEFAULT_VALUES(${isInputs ? 1 : 0})`;
    const ret = await this.ws.query(api);
    if (ret.err || ret.result !== '0') {
      this._busy = false;
      return;
    }
    await this.init();
    this._busy = false;
  }

  async clear(isInputs: boolean) {
    this._busy = true;
    const api = `?RMT_CLEAR_ALL_SELECTIONS(${isInputs ? 1 : 0})`;
    const ret = await this.ws.query(api);
    if (ret.err || ret.result !== '0') {
      this._busy = false;
      return;
    }
    await this.init();
    this._busy = false;
  }

  async export() {
    const state = await this.ws.query('?RMT_IS_EXPORT_READY');
    if (state.err) {
      this.snackbarService.openTipSnackBar('projectSettings.remote-io.err_export');
      return;
    } else if (state.result === '0') {
      return; // LIB WILL SHOW AN ERROR
    }
    try {
      const path = (await this.ws.query('?RMT_GET_FILE_PATH')).result;
      const content = await this.api.getPathFile(path);
      if (content.length) {
        this.utils.downloadFromText('RMT_CONFIG.DAT', content);
      } else {
        this.snackbarService.openTipSnackBar('dashboard.err_file');
        console.warn('File not found');
      }
    } catch (err) {
      console.warn('File not found');
    }
  }

  async import(e: Event ) {
    let path;
    this._busy = true;
    try {
      path = (await this.ws.query('?RMT_GET_FILE_PATH')).result;
      const i = path.lastIndexOf('/');
      path = path.substring(0,i+1);
    } catch (err) {
      console.warn(err);
      this._busy = false;
      return;
    }
    let count = 0;
    const target = e.target as HTMLInputElement;
    const targetCount = target.files.length;
    for (let i=0; i<target.files.length; i++) {
      const f = target.files.item(i);
      if (!f.name.toUpperCase().endsWith('.DAT')) {
        this._busy = false;
        target.files = null;
        target.value = '';
        return;
      }
      const renamedFile = new File([f], 'RMT_CONFIG.DAT');
      this.api.uploadToPath(renamedFile, true, path).then(async ret => {
        // ON SUCCUESS
        count++;
        if (count === targetCount) {
          let api = `?RMT_IMPORT_DATA(0)`;
          let ret = await this.ws.query(api);
          api = `?RMT_IMPORT_DATA(1)`;
          ret = await this.ws.query(api);
          await this.init();
          this._busy = false;
          target.files = null;
          target.value = '';
        }
      },
      (ret: HttpErrorResponse) => {
        // ON ERROR
        this._busy = false;
        target.files = null;
        target.value = '';
      });
    }
  }

  async onIOChange(io: IO, e: MatSelectChange, isInputs: boolean) {
    const original = io.associated_io;
    io.associated_io = Number(e.value);
    const api = io.associated_io === 0 ? 
      `?RMT_CLEAR_SELECTION(${isInputs ? 1 : 0},"${io.name}")` :
      `?RMT_SET_REMOTE_IO(${isInputs ? 1 : 0},"${io.name}",${io.associated_io},${io.invert})`;
    const ret = await this.ws.query(api);
    if (ret.err || ret.result !== '0') {
      io.associated_io = original;
    } else {
      this.refreshDropDown();
      if (io.associated_io === 0) {
        io.invert = 0;
      }
    }
  }

  async onIoInvertChange(io: IO, e: MatCheckboxChange, isInputs: boolean) {
    const original = io.invert;
    io.invert = e.checked ? 1 : 0;
    const api = `?RMT_SET_REMOTE_IO(${isInputs ? 1 : 0},"${io.name}",${io.associated_io},${io.invert})`;
    const ret = await this.ws.query(api);
    if (ret.err || ret.result !== '0') {
      io.invert = original;
    }
  }

  toNumber(val: string) {
    return Number(val);
  }

}

interface AssociationList {
  inputs: Array<IO>,
  outputs: Array<IO>
}

interface Device {
  'Control Device': string,
  'Devices': string
}

interface IO {
  name: string;
  associated_io: number;
  invert: 0 | 1
}