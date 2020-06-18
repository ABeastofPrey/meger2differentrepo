import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { ApiService, UploadResult } from './../../../core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../../core/services/utils.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'fwconfig-editor',
  templateUrl: './fwconfig-editor.component.html',
  styleUrls: ['./fwconfig-editor.component.css']
})
export class FwconfigEditorComponent implements OnInit {

  config: FWConfig = null;

  private words: {};

  toggleStaticIP(on: boolean) {
    this.config.setIP(on ? this.config.staticIP : null);
    this.updateFile();
  }

  onIPChange(ip: string) {
    this.config.setIP(ip);
    this.updateFile();
  }

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private trn: TranslateService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.trn.get(['error.err','changeOK']).subscribe(words=>{
      this.words = words;
    });
    this.api.getFile('FWCONFIG').then(ret=>{
      this.config = new FWConfig(ret);
    });
  }

  private updateFile() {
    const text = this.config.text;
    return this.api.uploadToPath(new File([new Blob([text])], 'FWCONFIG'),true,'')
      .then((ret: UploadResult) => {
        const result = ret.success ? this.words['changeOK'] : this.words['error.err'];
        // this.snack.open(result, '', { duration: 1500 });
        this.snackbarService.openTipSnackBar(result);
      }).catch(err => {
        console.warn(err);
      });
  }

}

class FWConfig {

  private readonly IPREGEX = /^\s*ipaddressmask\s*(\S+)/;
  private readonly DEFAULT_IP = '90.0.0.1:255.255.255.0';
  
  // private
  private _text = '';
  private _isStaticIP = false;
  private _staticIP = '';
  
  // public
  get text() { return this._text; }
  get isStaticIP() { return this._isStaticIP; }
  get staticIP() { return this._staticIP; }


  constructor(init: string) {
    this._text = init;
    const lines = init.split('\n');
    let ipFound = false;
    for (const line of lines) {
      const match = line.toLowerCase().match(this.IPREGEX);
      if (!match || !match[1]) continue;
      if (match[1] !== 'dhcp') {
        this._isStaticIP = true;
        this._staticIP = match[1];
      } else {
        this._staticIP = this.DEFAULT_IP;
      }
      ipFound = true;
      break;
    }
    if (!ipFound) {
      this._isStaticIP = true;
      this._staticIP = this.DEFAULT_IP;
    }
  }

  setIP(ip: string) { // if ip is null then DHCP will be used
    this._isStaticIP = ip !== null;
    this._staticIP = ip || this.DEFAULT_IP;
    const IP = 'ipaddressmask ' + (this._isStaticIP ? this._staticIP : 'dhcp');
    const lines = this._text.split('\n');
    let done = false;
    for (let i=0; i<lines.length; i++) {
      const line = lines[i];
      const match = line.toLowerCase().match(this.IPREGEX);
      if (!match || !match[1]) continue;
      lines[i] = IP;
      done = true;
      break;
    }
    if (!done && !this._isStaticIP) { // no matching line found, add line to FWCONFIG
      lines.push(IP);
    }
    this._text = lines.join('\n');
  }

}
