import { TranslateService } from '@ngx-translate/core';
import { environment } from './../../../../environments/environment.prod';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { WebsocketService } from './../../core/services/websocket.service';
import { ApiService } from './../../core/services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SafetyConfiguration } from '../../configuration/components/configuration/model/configuration.model';
import { UtilsService } from '../../core/services/utils.service';
import { HttpClient } from '@angular/common/http';
import { MatHorizontalStepper, MatSnackBar } from '@angular/material';
import { SysLogSnackBarService } from '../../sys-log/services/sys-log-snack-bar.service';

@Component({
  selector: 'app-safety-configurator',
  templateUrl: './safety-configurator.component.html',
  styleUrls: ['./safety-configurator.component.css']
})
export class SafetyConfiguratorComponent implements OnInit {

  @ViewChild('stepper', {static: false}) stepper: MatHorizontalStepper;

  // environment
  env = environment;

  // Current Configuration
  conf: SafetyConfiguration;

  // Configuration from DRIVE
  verifiedConf: SafetyConfiguration;

  // STEP CONTROLS
  step2 = new FormControl();
  step3 = new FormControl();
  step4 = new FormControl();

  // Variables
  password = '';
  private _isVerifying = true;
  private _isSealing = false;
  private _loading = true;
  private _guiStep = -1;
  private words = {};

  get isVerifying() {
    return this._isVerifying;
  }

  get isSealing() {
    return this._isSealing;
  }

  get loading() {
    return this._loading;
  }

  constructor(
    private api: ApiService,
    private ws: WebsocketService,
    private utils: UtilsService,
    private trn: TranslateService,
    private snack: MatSnackBar,
    private snackbarService: SysLogSnackBarService,
    private http: HttpClient) { }

  ngOnInit() {
    this.reset();
    this.trn.get(['error.err','dismiss']).subscribe(words=>{
      this.words = words;
    });
  }

  private showError(code: number) {
    // this.snack.open(this.words['error.err'] + ' ' + code,this.words['dismiss']);
    this.snackbarService.openTipSnackBar("error.err");
  }

  /* Load step i */
  private async loadStep(i: number) {
    let ini, asJSON;
    switch (i) {
      case 0:
        if (this._guiStep < 2) {
          console.log('Load INI from template...');
          ini = await this.http.get('/rs/assets/SC/template.ini', { responseType: 'text'}).toPromise();
        } else {
          console.log('Load INI from MC...');
          ini = await this.api.getPathFile('SC/USER.INI');
          if (ini.length === 0) {
            ini = await this.http.get('/rs/assets/SC/template.ini', { responseType: 'text'}).toPromise();
          }
        }
        asJSON = this.utils.parseINIString(ini);
        this.conf = new SafetyConfiguration(ini, asJSON);
        break;
      case 2:
        this.step2.setErrors(null);
        // GET INI FROM MC
        ini = await this.api.getPathFile('SC/FROMDRIVEG.INI');
        asJSON = this.utils.parseINIString(ini);
        this.verifiedConf = new SafetyConfiguration(ini, asJSON);
        this._isVerifying = false;
        break;
      case 3:
        this.step3.setErrors(null);
        break;
      case 4:
        this.step4.setErrors(null);
        break;
      default:
        break;
    }
  }

  ngAfterViewInit() {
    this._loading = true;
    this.ws.isConnected.subscribe(async stat=>{
      if (!stat) return;
      const status = await this.ws.query('?sc_cfg_gui_status');
      const idx = Number(status.result);
      const curr = isNaN(idx) ? 0 : idx;
      this._guiStep = curr;
      // SET PREVOUS STEPS TO INTERACTED and LOAD NEEDED DATA
      const steps = this.stepper.steps.toArray();
      for (let i=0; i<=curr; i++) {
        await this.loadStep(i);
        steps[i].interacted = true;
      }
      // JUMP TO CURRENT STEP
      this.stepper.selectedIndex = curr;
      this._loading = false;
    });
  }

  async export() {
    const ret = await this.ws.query('?sc_cfg_is_file_sealed');
    if (ret.err || ret.result === '0') {
      this.showError(1);
      return;
    }
    await this.ws.query('?sc_cfg_read_configuration_file("user.cdc")');
    const getCDC = await this.api.getFromDrive('192.168.57.100','SafetyConfiguration.cdc','SC/fromDrive.cdc');
    if (!getCDC) {
      this.showError(2);
      return;
    }
    this.api.getRawFile('SC/fromDrive.cdc');
  }

  async import(e: { target: { files: FileList, value: string } } ) {
    const f = e.target.files.item(0);
    const ret = await this.api.uploadToPath(f,true,'SC/');
    if (ret.err || !ret.success) {
      this.showError(3);
    }
    this.reset();
    // CONVERT TO INI
    const toIni = await this.api.cdcToIni(f.name.toUpperCase());
    // GET INI FROM MC
    const nameOnly = f.name.toUpperCase().substring(0,f.name.lastIndexOf('.'));
    const ini = await this.api.getPathFile(`SC/${nameOnly}G.INI`);
    const asJSON = this.utils.parseINIString(ini);
    this.conf = new SafetyConfiguration(ini, asJSON);
    e.target.files = null;
    e.target.value = '';
  }

  async confirmPassword() {
    const cmd = `?SC_CFG_ENTER_PASSWORD("${this.password}")`;
    const ret = await this.ws.query(cmd);
    if (ret.result === '0') {
      this.step2.setErrors(null);
      this.stepper.selectedIndex = 2;
      const ret = await this.sendIniToDrive();
      if (!ret) {
        this.showError(4);
        return;
      }
      let result = await this.ws.query('?sc_cfg_set_cdc_file_name("user.cdc")');
      if (result.result !== '0' || result.err) {
        this.showError(5);
        return;
      }
      let status = await this.waitForStatus('15');
      if (status !== '15') {
        this.showError(6);
        console.log('got ' + status + ', expected 15');
        return;
      }
      result = await this.ws.query('?sc_cfg_read_configuration_file("user.cdc")');
      if (result.result !== '0' || result.err) {
        this.showError(7);
        return;
      }
      status = await this.waitForStatus('23');
      if (status !== '23') {
        this.showError(8);
        console.log('got ' + status + ', expected 23');
        return;
      }
      const getCDC = await this.api.getFromDrive('192.168.57.100','SafetyConfiguration.cdc','SC/fromDrive.cdc');
      if (!getCDC) {
        this.showError(9);
        return;
      }
      // Convert CDC to INI
      const toINI = await this.api.cdcToIni('fromDrive.cdc');
      this._isVerifying = false;
      if (!toINI) {
        this.showError(10);
        return;
      }
      // GET INI FROM MC
      const ini = await this.api.getPathFile('SC/FROMDRIVEG.INI');
      const asJSON = this.utils.parseINIString(ini);
      this.verifiedConf = new SafetyConfiguration(ini, asJSON);
    }
  }

  async seal() {
    this._isSealing = true;
    const ret = await this.ws.query('?SC_CFG_SEAL_CONFIGURATION_FILE("user.cdc")');
    if (ret.err || ret.result !== '0') {
      this._isSealing = false;
      this.showError(11);
      return;
    }
    const status = await this.waitForStatus('28');
    this._isSealing = false;
    if (status !== '28') {
      this.showError(12);
      console.log('got ' + status + ', expected 23');
      return;
    }
    this.step3.setErrors(null);
    setTimeout(()=>{
      this.stepper.selectedIndex = 3;
    },500);
  }

  reset() {
    this.step2.setErrors([{passRequired: true}]);
    this.step3.setErrors([{seal: 'Not sealed'}]);
    this.step4.setErrors([{confirm: 'Not Confirmed'}]);
    this.verifiedConf = null;
    this._isVerifying = true;
    this._isSealing = false;
    if (!this.stepper) return;
    this.stepper.steps.forEach(s=>{
      s.interacted = false;
    });
    this.stepper._stateChanged();
  }

  onStepChange(e: StepperSelectionEvent) {
    if (e.selectedIndex === this._guiStep) return;
    this._guiStep = e.selectedIndex;
    this.ws.query('sc_cfg_gui_status = ' + this._guiStep);
  }

  waitForStatus(status: string): Promise<string> {
    return new Promise(resolve=>{
      let currStatus = '-1';
      let interval;
      const timeout = setTimeout(()=>{
        if (currStatus !== status) {
          clearInterval(interval);
          resolve(currStatus);
        }
      }, 12000);
      interval = setInterval(async ()=>{
        if (status === currStatus) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(currStatus);
          return;
        }
        const ret = await this.ws.query('?SC_CFG_GET_STATUS');
        currStatus = ret.err ? '-1' : ret.result;
        if (status === currStatus) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(currStatus);
          return;
        }
      },1000);
    });
  }

  confirmConf() {
    this.step4.setErrors(null);
    this.stepper.selectedIndex = 4;
  }

  async sendIniToDrive() {
    const ini = this.conf.ini;
    const f = new File([new Blob([ini])], 'USER.INI');
    const ret = await this.api.uploadToPath(f, true, 'SC/');
    if (ret.success) {
      const cdc = await this.api.iniToCDC('USER.INI');
      if (cdc) {
        const sendToDrive = await this.api.sendToDrive('SC/USER.cdc', '192.168.57.100');
        return sendToDrive;
      }
    }
    return false;
  }

}
