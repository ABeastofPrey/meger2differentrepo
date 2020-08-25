import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subject, Subscription, interval } from 'rxjs';
import { map, first, filter, takeUntil, take } from 'rxjs/operators';
import {
  WebsocketService,
  ApiService,
  MCQueryResponse,
  TpStatService,
} from '../core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CSProgressComponent } from '../../components/progress/progress.component';
import { UtilsService } from '../core/services/utils.service';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import * as JSZip from 'jszip';
import { mergeDeepRight } from 'ramda';

export enum LibResponseRes {
  Success = 1,
  Failed = 0,
}

export enum PluginInStallIsReady {
  notReady = 0,
  ready = 1,
}

export enum VersionState { //
  NotInstall = 0, //doesn't exist plugin
  SameVersion = 1, //have install same plugin
  DiffVersion = 2, //haver install diff plugin
  Error = -1, //unexpect error
}

export interface CheckHistoryVersion {
  state?: VersionState;
  name?: String;
  version?: String; //installed
  install?: string; // current will install
  [key: string]: any;
}

export enum DependenciesCheckState {
  satisfied = 0, //can install
  unSatisfied = 1, // require other dependencies
}

export interface DependenciesCheck {
  //{"state":1,"name":["CS+","plug3"],"require":["v2.1.7","v2.4.1"],"act":["v2.1.1","v2.4.0"]}
  state?: DependenciesCheckState;
  name?: string | string[];
  require?: string | string[];
  act?: string | string[];
  dependencies?: DependenciesCheck[];
}

export enum DuplicationCheckState { //check the name
  NoDuplicateFile = 0,
  HasDuplicateFile = 1,
}

export interface DuplicationCheck {
  state: DuplicationCheckState;
  files: string[]; //duplicate file name
  filesStr: string;
  [key: string]: any;
}

export enum UnexpectionError {
  fileLoading = 'pluginInstall.fileLoading',
  noConfiFile = 'pluginInstall.noConfiFile',
  createFoldError = 'pluginInstall.createFoldError',
  uploadFile = 'pluginInstall.uploadError',
  versionCheck = 'pluginInstall.versionCheckEror',
  dependenciesCheck = 'pluginInstall.dependenciesCheck.dependenciesCheckError',
  duplicationCheck = 'pluginInstall.duplicationCheck.detectionError',
  installFailed = 'pluginInstall.installing.installFailed',
  unzipError = 'pluginInstall.unzipError',
  pluginNameError = 'pluginInstall.pluginNameError',
}

export interface IPluginI18n {
  plugin_name: string;
  [key: string]: any;// 'lib_code_' + environment.langs.en or cmn
}

@Injectable()
export class PluginsService implements OnDestroy {
  public filepath = '@TMPFOLDER';

  private noticer: Subject<boolean> = new Subject();

  public configFileData: any; //plugin install config file data

  public libTranslations: Map<string, any> = new Map();

  constructor(
    private ws: WebsocketService,
    private tpStatService: TpStatService,
    private translateService: TranslateService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private apiService: ApiService
  ) { }

  ngOnDestroy() {
    this.noticer.next(true);
    this.noticer.unsubscribe();
  }

  //create Plugin temp folder
  public createPluginFolder(): Promise<boolean> {
    return new Promise(resolve => {
      this.ws
        .observableQuery(`?PLUG_CREATE_FOLDER("${this.filepath}")`)
        .pipe(map((res: MCQueryResponse) => res.result))
        .subscribe((createRes: string) => {
          if (!createRes || +createRes === LibResponseRes.Failed) {
            // 0 failed 1 success
            return resolve(false);
          }
          return resolve(true);
        });
    });
  }

  //upload plugin config file to folder
  public uploadPluginConfigFile(configFiles: File[]): Promise<boolean> {
    if (!configFiles || configFiles.length < 1) {
      return Promise.resolve(false);
    }
    let promiseAll: Promise<any>[] = [];
    for (let file of configFiles) {
      promiseAll.push(
        this.apiService.uploadToPath(file, true, `${this.filepath}/`)
      );
    }
    return new Promise(resolve => {
      Promise.all(promiseAll).then(res => {
        if (!res) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  public inStallIsReady(): Observable<PluginInStallIsReady> {
    return this.ws.observableQuery('?PLUG_IsInstallReady').pipe(
      first(),
      map((res: MCQueryResponse) => +res.result)
    );
  }

  public pluginExistCheck(): Observable<CheckHistoryVersion | any> {
    return this.ws.observableQuery('?PLUG_ExistenceCheck').pipe(
      first(),
      map((res: MCQueryResponse) => JSON.parse(res.result))
    );
  }

  // check the requirements of plugin installtion
  public pluginDependenciesCheck(): Observable<DependenciesCheck> {
    return this.ws.observableQuery('?PLUG_DependencyCheck').pipe(
      first(),
      map((res: MCQueryResponse) => JSON.parse(res.result))
    );
  }

  public duplicationCheck(): Observable<DuplicationCheck | any> {
    return this.ws.observableQuery('?PLUG_DuplicationCheck').pipe(
      first(),
      map((res: MCQueryResponse) => JSON.parse(res.result))
    );
  }

  //all ready plugin install xxx.zip
  public installPlugin(filename: string): Observable<LibResponseRes | any> {
    let command = `?PLUG_INSTALL_PLUGIN("${filename}")`;
    return this.ws.observableQuery(command).pipe(
      first(),
      map((res: MCQueryResponse) => {
        return (res && res.result) || null;
      })
    );
  }

  //cancel plugin install progress
  public cancelPluginInstall(): Observable<LibResponseRes | any> {
    return this.ws.observableQuery('?PLUG_INSTALL_CANCEL').pipe(
      first(),
      map((res: MCQueryResponse) => JSON.parse(res.result))
    );
  }

  //plugin install successful
  public setPluginInfo(comm: string): Observable<LibResponseRes | any> {
    return this.ws.observableQuery(comm).pipe(
      first(),
      map((res: MCQueryResponse) => res)
    );
  }

  public onUploadFilesChangePlugin(e: {
    target: { files: File[]; value: File };
  }): Observable<any> {
    // this.pluginDisabled = false;
    if (!e || !e.target || !e.target.files) {
      return of({ error: 'pluginInstall.chooseFileError' });
    }

    let file = e.target.files[0];
    let reg = /\.(zip|ZIP)$/;
    //file type check need zip
    if (!file || !reg.test(file.name)) {
      return of({ error: 'pluginInstall.fileFormatError' });
    }

    //file size check need < 100M
    let maxSize = 100 * 1000 * 1024;
    if (file.size >= maxSize) {
      return of({ error: 'pluginInstall.exceedSize' });
    }

    return of({ file: file }); //successful
  }

  //plugin install service
  public async readFile(
    file: File
  ): Promise<{ error?: string; successful?: boolean }> {
    return new Promise<any>(resolve => {
      JSZip.loadAsync(file) // 1) read the Blob
        .then(
          async zip => {
            if (!zip) return resolve({ error: UnexpectionError.unzipError });

            let configName = 'CONFIG';
            let configFileMap: Map<string, any> = new Map();
            configFileMap.set(configName, {
              //necessary
              name: `PLUGIN_${configName}.DAT`,
              i18n: false,
              state: false, //has not get file
            });

            for (let lang in environment.langs) {
              let key: string = lang.toUpperCase();
              configFileMap.set(key, {
                //not necessary
                name: `PLUGIN_${key}.DAT`,
                key: key,
                i18n: true,
                state: false, //has not get file
              });
            }

            zip.forEach((relativePath, zipEntry: JSZip.JSZipObject) => {
              // 2) print entries
              if (zipEntry.dir === false) {
                for (let configNode of configFileMap.values()) {
                  if (configNode.name === relativePath) {
                    configNode.state = true;
                    continue;
                  }
                }
              }
            });

            if (!configFileMap.get(configName).state) {
              // hasn't get install config file
              return resolve({ error: UnexpectionError.noConfiFile });
            }

            //merge local translate with remote I18 translatw file
            try {
              // let allConfigFiles: File[] = [];
              for (let valueNode of configFileMap.values()) {
                if (valueNode.state && valueNode.i18n) {
                  //exist lib lang json
                  const localStr = await zip
                    .file(valueNode.name)
                    .async('string');

                  this.libTranslations.set(
                    valueNode.key,
                    JSON.parse(localStr)
                  );
                  // const merged = JSON.stringify(
                  //   this.libTranslations.get(valueNode.key)
                  // );
                  // let cmnFile = this.stringToJSONFile(
                  //   merged,
                  //   `LIB_${valueNode.key}.JSON`
                  // );
                  // allConfigFiles.push(cmnFile);
                }
              }

              zip
                .file(configFileMap.get(configName).name)
                .async('string')
                .then(
                  configData => {
                    if (!configData) {
                      return resolve({ error: UnexpectionError.unzipError });
                    }
                    //upload config file to specific folder
                    this.createPluginFolder().then(createFolderRes => {
                      if (!createFolderRes) {
                        return resolve({ error: UnexpectionError.createFoldError });
                      }

                      this.configFileData = JSON.parse(configData);

                      //plugin name check only can contain _ .  A-Z a-z and 0 -9
                      let pluginName = this.configFileData.name;
                      let reg = /[\w.]$/;
                      if (!reg.test(pluginName)) {
                        return resolve({
                          error: UnexpectionError.pluginNameError,
                        });
                      }

                      let configFile = this.stringToJSONFile(
                        configData,
                        'PLUGIN_CONFIG.DAT'
                      );

                      this.uploadPluginConfigFile([configFile]).then(
                        uploadFileRes => {
                          //upload config file
                          if (!uploadFileRes) {
                            return resolve({
                              error: UnexpectionError.uploadFile,
                            });
                          }

                          return resolve({ successful: true });
                        }
                      );
                    });
                  },
                  error => {
                    console.error(error);
                    return resolve({ error: UnexpectionError.unzipError });
                  }
                );
            } catch (error) {
              console.error(error);
              return resolve({ error: UnexpectionError.unzipError });
            }
          },
          e => {
            console.error(e);
            return resolve({ error: UnexpectionError.unzipError });
          }
        );
    });
  }

  //
  private processDialogRef: MatDialogRef<CSProgressComponent>;
  private progressValue: number = 10;
  private installSub: Subscription;

  public startInstallPlugin(fileName: string): void {
    this.progressValue = 10; //reset value
    this.processDialogRef = this.dialog.open(CSProgressComponent, {
      width: '500px',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: {
        title: 'pluginInstall.installing.title',
        value: this.progressValue,
        bufferValue: 2,
      },
    });

    //mock progress percentage
    let intervalSub: Subscription = interval(1000)
      .pipe(take(4))
      .subscribe(mockPercentage => {
        if (!this.processDialogRef) return;
        this.processDialogRef.componentInstance.value = this.progressValue =
          (mockPercentage + 1) * 20;
        this.processDialogRef.componentInstance.bufferValue = 10;
      });

    this.clear();

    this.installSub = this.installPlugin(fileName)
      .pipe(takeUntil(this.noticer))
      .subscribe((res: any) => {
        intervalSub && intervalSub.unsubscribe();

        if (!res || res != LibResponseRes.Success) {
          // this.setPluginInstallResult(LibResponseRes.Failed); // notice lib plugin install failed
          //install failed
          //excute rollback
          this.rollbackPlugin();
          return;
        }

        this.processDialogRef.componentInstance.value = this.progressValue = 82;
        this.processDialogRef.componentInstance.bufferValue = 10;

        this.reloadSys(); //reload system
      });
  }

  private kiiTaskSub: Subscription;
  private reloadSys() {
    this.clear();

    this.kiiTaskSub = this.ws
      .observableQuery(`?PLUG_PRG_PRE_KILL`) //kill a task will effect the systemp reload
      .pipe(takeUntil(this.noticer))
      .subscribe(killTaskRes => {
        this.processDialogRef.componentInstance.value = this.progressValue = 85;
        this.processDialogRef.componentInstance.bufferValue = 10;

        this.utilsService.resetAll(true).then(resetRes => {
          this.processDialogRef.componentInstance.value = this.progressValue = 92;
          this.processDialogRef.componentInstance.bufferValue = 8;
          this.processDialogRef.componentInstance.title = 'loading';
          this.watchSysState();
        });
      });
  }

  //watch system state ,if sstatus is true the system reload successful
  private statusSub: Subscription;
  private watchSysState(): void {
    this.clear();
    this.statusSub = this.tpStatService.onlineStatus
      .pipe(takeUntil(this.noticer))
      .subscribe(status => {
        if (!status) return;
        this.loadJS(this.configFileData.scripts);
        this.mergeTranslate();
        this.setPluginInstallResult(LibResponseRes.Success); // notice lib plugin install successed
        this.processDialogRef.componentInstance.value = 100; //loading application progress
        this.processDialogRef.componentInstance.bufferValue = 0;
        this.processDialogRef.componentInstance.title = 'loading';
        this.clear();
        this.processDialogRef.close();
      });
  }

  public stringToJSONFile(data: string, fileName): File {
    let file = new File([data], fileName, {
      type: 'application/json',
      lastModified: Date.now(),
    });

    return file;
  }

  //update lib_code
  private mergeTranslate(): void {
    for (let lang in environment.langs) {
      if (
        this.libTranslations.has(lang.toUpperCase()) &&
        this.translateService.translations[lang]
      ) {
        this.translateService.translations[lang][
          'lib_code'
        ] = mergeDeepRight(this.translateService.translations[lang][
          'lib_code'
        ], this.libTranslations.get(lang.toUpperCase())['lib_code']);
      }
    }
  }

  //load js
  public jsNameMap: Map<string, string> = new Map();
  public loadJS(jsNames: string[]): void {
    if (!jsNames || !jsNames.length) return;
    let fragment = document.createDocumentFragment();
    let hasNewJS: boolean = false;
    for (let name of jsNames) {
      if (this.jsNameMap.has(name)) continue;
      hasNewJS = true;
      this.jsNameMap.set(name, name);
      const script = document.createElement('script');
      script.src = `assets/plugin/${name}`;
      fragment.appendChild(script);
    }

    if (!hasNewJS) return;
    document.head.appendChild(fragment);
  }

  // set plugin install result
  public setPluginInstallResult(state: LibResponseRes): void {
    this.ws.observableQuery(`PLUG_SHOW_INSTALL_RESULT(${state})`).subscribe();
  }

  //Rollbacking Plugin
  public rollbackPlugin(): void {
    // return of(null);
    this.processDialogRef.componentInstance.progressbarTheme = 'gray-theme';
    this.processDialogRef.componentInstance.title = 'pluginInstall.rollback';
    this.watchRollbackProgress();

    this.ws.observableQuery('?PLUG_INSTALL_ROLLBACK').subscribe(res => {
      this.rollbackProgressSub && this.rollbackProgressSub.unsubscribe();
      this.processDialogRef && this.processDialogRef.close();
    });
  }

  //watch rollback progress
  private rollbackProgressSub: Subscription;
  public watchRollbackProgress() {
    let takeNum = Math.floor(this.progressValue / 10);
    this.rollbackProgressSub && this.rollbackProgressSub.unsubscribe();
    this.rollbackProgressSub = interval(600)
      .pipe(
        take(takeNum),
        takeUntil(this.noticer)
      )
      .subscribe(
        res => {
          if (!this.processDialogRef) return;
          let value = this.progressValue - res * 10;
          value = value < 0 ? 2 : value;
          this.processDialogRef.componentInstance.value = value;
        },
        error => {
          console.log(error);
        }
      );
  }

  //clear subject
  public clear() {
    this.rollbackProgressSub && this.rollbackProgressSub.unsubscribe();
    this.installSub && this.installSub.unsubscribe();
    this.statusSub && this.statusSub.unsubscribe();
    this.kiiTaskSub && this.kiiTaskSub.unsubscribe();
  }

}

export function parsePluginI18n(pluginTranslateData: string, lang: string): { [key: string]: string } {
  const pluginJSON: IPluginI18n[] = JSON.parse(pluginTranslateData);
  if (!pluginJSON || pluginJSON.length < 0) return {};
  const key = `lib_code_${lang.toLocaleLowerCase()}`;
  let i18nData = {};
  pluginJSON.forEach((item) => i18nData = mergeDeepRight(i18nData, item[key] || {}));
  return i18nData;
}
