import { Injectable } from '@angular/core';
import { Observable, of, from, combineLatest, throwError } from 'rxjs';
import { map as rxjsMap, tap, catchError, switchMap, debounceTime } from 'rxjs/operators';
import { WebsocketService } from '../../core/services/websocket.service';
import { ApiService, Log } from '../../core/services/api.service';
import { ModuleVersionService } from '../../core/services/module-version.service';
import { isTrue, isNotEmpty } from 'ramda-adjunct';
import {
    compose, range, reduce, isNil, isEmpty, concat, all, last, map,
    sortBy, prop, length, filter, lt, dropRepeatsWith, eqProps, __
} from 'ramda';
import { SysLogFetchService } from '../../sys-log/services/sys-log-fetch.service';
import { SystemLog } from '../../sys-log/enums/sys-log.model';

interface DeviceNode {
    name: string;
    type: string;
    children?: DeviceNode[];
    status: number;
    level?: number;
}

interface User {
    fullName: string;
    permission: string;
    username: string;
}

interface Account {
    name: string,
    date: string,
    todo: string,
}

const getNameStructureByPreOrder = (nodes: DeviceNode[], res = '') => {
    if (isEmpty(nodes) || isNil(nodes)) return res;
    const root: DeviceNode = nodes.shift();
    if (isNil(root.level)) root.level = 0;
    const placeHolder = reduce(acc => acc += '    ', '', range(0, root.level));
    res = `${res}${placeHolder}${root.name}\r\n`;
    if (isNotEmpty(root.children)) {
        root.children.forEach(node => node.level = root.level + 1);
        nodes = concat(root.children, nodes);
    }
    return getNameStructureByPreOrder(nodes, res);
};

const placeHolder = count => reduce(acc => acc + ' ', '', range(0, count));

const dashPlaceholder = count => reduce(acc => acc + '-', '', range(0, count));

const tabPlaceholder = '    ';

@Injectable()
export class DiagnosisService {
    constructor(
        private webService: WebsocketService,
        private apiService: ApiService,
        private sysLogFetch: SysLogFetchService,
        private versionService: ModuleVersionService
    ) { }

    public prepare2Diagnosis(): Observable<boolean> {
        const api1 = '?DIAG_PREPARE_MADA_FILE';
        const api2 = '?DIAG_PREPARE_FOLDERS';
        return this.webService.simpleQuery(api1).pipe(
            catchError(() => {
                console.warn('Prepare MadaInformation.txt failed.');
                return of(true);
            }),
            switchMap(() => this.webService.simpleQuery(api2)),
            rxjsMap(success => success !== '-1'),
            catchError(() => throwError('Prepare to diagnosis failed.')),
        );
    }

    public uploadFiles(): Observable<boolean> {
        return this.uploadSysLogFiles().pipe(
            debounceTime(50),
            switchMap(this.uploadUsersFile.bind(this)),
            debounceTime(50),
            switchMap(this.uploadDeviceTopologyFile.bind(this)),
            debounceTime(50),
            switchMap(this.uploadSwitchAccountInfoFile.bind(this)),
            debounceTime(50),
            switchMap(this.uploadMataInfoFile.bind(this)),
            debounceTime(50)
        );
    }

    /**
     * This function will return the folder name,
     * which will be used as zip file name for the parameter of "downloadZipFile" function.
     *
     * @returns {Observable<string>} The folder name.
     * @memberof DiagnosisService
     */
    public prepareModuleVersion(): Observable<string> {
        return this.versionService.getModuleVersion().pipe(
            rxjsMap(res => ({
                libVer: `${res.mainLibryVersion.moduleVern} ${res.mainLibryVersion.versonDate}`,
                webVer: `${res.webserverVersion.moduleVern} ${res.webserverVersion.versonDate}`,
                guiVer: `${res.uiVersion.moduleVern} ${res.uiVersion.versonDate}`
            })),
            rxjsMap(({ libVer, webVer, guiVer }) => `?DIAG_PREPARE_FILES("${libVer}", "${webVer}", "${guiVer}")`),
            switchMap(this.webService.simpleQuery.bind(this.webService)),
            catchError(() => throwError('Prepare module version failed.'))
        );
    }

    /**
     * After finish "prepareModuleVersion", we will get the folder name and zip it.
     *
     * @param {string} folderName
     * @returns {Observable<boolean>}
     * @memberof DiagnosisService
     */
    public downloadZipFile(folderName: string): Observable<boolean> {
        if (folderName === '') return throwError(false);
        return from(this.apiService.downloadProjectZip(folderName)).pipe(
            rxjsMap(() => true),
            catchError(() => throwError('Download zip file failed.'))
        );
    }

    public deleteFolder(): Observable<boolean> {
        const api = '?DIAG_CLEAR_FOLDERS';
        return this.webService.simpleQuery(api).pipe(
            rxjsMap(success => success !== '-1'),
            catchError(() => throwError('Delete diagnosis folder failed.'))
        );
    }

    private uploadTxtFile(name: string, path: string, content: string): Observable<boolean> {
        const file = fileStr => new File([fileStr], name, { type: "text/plain", });
        const upload = file => from(this.apiService.uploadToPath(file, true, path));
        const uploadDTFile = compose(upload, file);
        return uploadDTFile(content).pipe(rxjsMap(prop('success')));
    }

    private uploadSysLogFiles(): Observable<boolean> {
        const totalLogFile = 'TotalLog.txt';
        const infoLogFile = 'InfomationLog.txt';
        const warnLogFile = 'WarningLog.txt';
        const errLogFile = 'ErrorLog.txt';
        const filePath = '@DIAG/User Logs/LogBook/';
        let maxFile = 4;
        let maxTask = 6;
        let maxCode = 5;
        let maxModule = 6;
        let maxSource = 6;
        const getPropMax = (logs: SystemLog[]) => {
            for (let log of logs) {
                if (log.file && log.file.length > maxFile) maxFile = log.file.length;
                if (log.task && log.task.length > maxTask) maxTask = log.task.length;
                if (log.code && String(log.code).length > maxCode) maxCode = String(log.code).length;
                if (log.module && log.module.length > maxModule) maxModule = log.module.length;
                if (log.source && log.source.length > maxSource) maxSource = log.source.length;
            }
        };

        const generateFileString = (logs: SystemLog[]): string => {
            //tslint:disable-next-line
            const firstLine =
                'Id' + placeHolder(34) + tabPlaceholder +
                'Code' + placeHolder(maxCode - 4) + tabPlaceholder +
                'Date Time' + placeHolder(10) + tabPlaceholder +
                'Type' + placeHolder(7) + tabPlaceholder +
                'Source' + placeHolder(maxSource - 6) + tabPlaceholder +
                'Task' + placeHolder(maxTask - 4) + tabPlaceholder +
                'File' + placeHolder(maxFile - 4) + tabPlaceholder +
                'Line ' + tabPlaceholder +
                'Module' + placeHolder(maxModule - 6) + tabPlaceholder +
                'Info' + '\r\n';
            //tslint:disable-next-line
            const secondLine =
                dashPlaceholder(36) + tabPlaceholder +
                dashPlaceholder(maxCode) + tabPlaceholder +
                dashPlaceholder(19) + tabPlaceholder +
                dashPlaceholder(11) + tabPlaceholder +
                dashPlaceholder(maxSource) + tabPlaceholder +
                dashPlaceholder(maxTask) + tabPlaceholder +
                dashPlaceholder(maxFile) + tabPlaceholder +
                dashPlaceholder(5) + tabPlaceholder +
                dashPlaceholder(maxModule) + tabPlaceholder +
                dashPlaceholder(32) + '\r\n';
            return reduce((acc, log: SystemLog) => {
                const { id, date, time, type, source } = log;
                const code = log.code ? log.code : '';
                const task = log.task ? log.task : '';
                const file = log.file ? log.file : '';
                const line = log.line ? log.line : '';
                const _module = log.module ? log.module : '';
                //tslint:disable-next-line
                return acc +
                    id + tabPlaceholder +
                    code + placeHolder(maxCode - String(code).length) + tabPlaceholder +
                    date + ' ' + time + placeHolder(19 - length(date + time) - 1) + tabPlaceholder +
                    type + placeHolder(11 - type.length) + tabPlaceholder +
                    source + placeHolder(maxSource - source.length) + tabPlaceholder +
                    task + placeHolder(maxTask - task.length) + tabPlaceholder +
                    file + placeHolder(maxFile - file.length) + tabPlaceholder +
                    line + placeHolder(5 - String(line).length) + tabPlaceholder +
                    _module + placeHolder(maxModule - _module.length) + tabPlaceholder +
                    log.message + '\r\n';
            }, firstLine + secondLine, logs);
        };
        const generateFilesString = (logs: SystemLog[]): string[] => {
            const infoLogs = filter((x: SystemLog) => x.type === 'information')(logs);
            const warnLogs = filter((x: SystemLog) => x.type === 'warning')(logs);
            const erroLogs = filter((x: SystemLog) => x.type === 'error')(logs);
            const totalLogString = generateFileString(logs);
            const infoLogString = generateFileString(infoLogs);
            const warnLogString = generateFileString(warnLogs);
            const erroLogString = generateFileString(erroLogs);
            return [totalLogString, infoLogString, warnLogString, erroLogString];
        };
        const uploadTotalLogFile = fileString => this.uploadTxtFile(totalLogFile, filePath, fileString);
        const uploadInfoLogFile = fileString => this.uploadTxtFile(infoLogFile, filePath, fileString);
        const uploadWarnLogFile = fileString => this.uploadTxtFile(warnLogFile, filePath, fileString);
        const uploadErroLogFile = fileString => this.uploadTxtFile(errLogFile, filePath, fileString);
        const uploadFiles = ([total, info, warn, erro]) => {
            return combineLatest([
                uploadTotalLogFile(total),
                uploadInfoLogFile(info),
                uploadWarnLogFile(warn),
                uploadErroLogFile(erro)
            ]);
        };
        return this.sysLogFetch.fetchSysLog().pipe(
            tap(getPropMax),
            rxjsMap(generateFilesString),
            switchMap(uploadFiles),
            rxjsMap(all(isTrue))
        );
    }

    private uploadUsersFile(): Observable<boolean> {
        const fileName = 'User_Information.txt';
        const filePath = '@DIAG/tmp/';
        const nameProp = prop('username');
        const fullNameProp = prop('fullName');
        const sortByNameLength = sortBy(compose(length, nameProp));
        const getMaxNameLength = compose(length, nameProp, last, sortByNameLength);
        const sortByFullNameLength = sortBy(compose(length, fullNameProp));
        const getMaxFullNameLength = compose(length, fullNameProp, last, sortByFullNameLength);
        const generateFileString = users => {
            const maxNameLength = getMaxNameLength(users);
            const maxFullNameLength = getMaxFullNameLength(users);
            const firstLine = `Name${placeHolder(maxNameLength - 4)}${tabPlaceholder}Full Name${placeHolder(maxFullNameLength - 9)}${tabPlaceholder}Permission\r\n`;
            const secondLine = `${dashPlaceholder(maxNameLength)}${tabPlaceholder}${dashPlaceholder(maxFullNameLength)}${tabPlaceholder}-----------------\r\n`;
            return reduce((acc, user: User) => {
                //tslint:disable-next-line
                return `${acc}${user.username}${placeHolder(maxNameLength - user.username.length)}${tabPlaceholder}${user.fullName}${placeHolder(maxFullNameLength - user.fullName.length)}${tabPlaceholder}${user.permission}\r\n`
            }, firstLine + secondLine, users);
        };
        const uploadUsersFile = fileString => this.uploadTxtFile(fileName, filePath, fileString);
        return this.getAllUser().pipe(rxjsMap(generateFileString), switchMap(uploadUsersFile));
    }

    private uploadSwitchAccountInfoFile(): Observable<boolean> {
        const fileName = 'UserSwitchingInfomation.txt';
        const filePath = '@DIAG/User Logs/';
        const nameProp = prop('name');
        const sortByNameLength = sortBy(compose(length, nameProp));
        const getMaxNameLength = compose(length, nameProp, last, sortByNameLength);
        const generateFileString = (accounts: Account[]) => {
            const maxName = getMaxNameLength(accounts);
            const maxNameLength = maxName > 4 ? maxName : 4;
            const firstLine =
                'Name' + placeHolder(maxNameLength - 4) + tabPlaceholder +
                'Date Time' + placeHolder(10) + tabPlaceholder +
                'Todo' + '\r\n';
            const secondLine = `${dashPlaceholder(maxNameLength)}${tabPlaceholder}${dashPlaceholder(19)}${tabPlaceholder}${dashPlaceholder(7)}\r\n`;
            return reduce((acc, account: Account) => {
                return acc + account.name + placeHolder(maxNameLength - account.name.length) + tabPlaceholder +
                    account.date + tabPlaceholder +
                    account.todo + '\r\n';
            }, firstLine + secondLine, accounts);
        };
        const uploadFile = fileString => this.uploadTxtFile(fileName, filePath, fileString);
        return this.getSwitchAccountInfo().pipe(rxjsMap(generateFileString), switchMap(uploadFile));
    }

    private uploadDeviceTopologyFile(): Observable<boolean> {
        const path = '@DIAG/Robot Config/';
        const name = 'DeviceTopology.txt';
        const dtfile = res => new File([res], name, { type: "text/plain", });
        const upload = file => from(this.apiService.uploadToPath(file, true, path));
        const uploadDTFile = compose(upload, dtfile);
        return this.getDeviceTopology().pipe(rxjsMap(res => getNameStructureByPreOrder([res])), switchMap(uploadDTFile));
    }

    private uploadMataInfoFile(): Observable<boolean> {
        const fileName = 'Mada_Information.txt';
        const filePath = '@DIAG/tmp/';
        const madaFile = 'MadaInformation.txt';
        const uploadFile = fileString => this.uploadTxtFile(fileName, filePath, fileString);
        return this.apiService.getFileFromDrive(madaFile).pipe(
            catchError(() => of('')),
            switchMap(uploadFile),
        );
    }

    private getDeviceTopology(): Observable<DeviceNode> {
        const api = '?TOP_getTopology';
        const errHandler = err => {
            console.warn(err);
            return of([]);
        };
        const resHandler = (res: string) => JSON.parse(res)[0];
        return this.webService.simpleQuery(api).pipe(rxjsMap(resHandler), catchError(errHandler));
    }

    private getAllUser(): Observable<User[]> {
        const getPermision = user => ({ ...user, permission: this.apiService.getUserPermission(user.permission) });
        return <Observable<User[]>>from(this.apiService.getUsers()).pipe(rxjsMap(map(getPermision)));
    }

    private getSwitchAccountInfo(): Observable<Account[]> {
        const lt10 = lt(__, 10);
        const convertDate = timestamp => {
            const date = new Date(timestamp);
            const year = date.getUTCFullYear();
            const moth = date.getUTCMonth() + 1;
            const uDay = date.getUTCDate();
            return `${year}/${lt10(moth) ? `0${moth}` : moth}/${lt10(uDay) ? `0${uDay}` : uDay}`;
        };
        const convertTime = timestamp => {
            const date = new Date(timestamp);
            const hors = date.getUTCHours();
            const mins = date.getUTCMinutes();
            const secs = date.getUTCSeconds();
            return `${lt10(hors) ? `0${hors}` : hors}:${lt10(mins) ? `0${mins}` : mins}:${lt10(secs) ? `0${secs}` : secs}`;
        };
        const dateTime = timestamp => `${convertDate(timestamp)} ${convertTime(timestamp)}`;
        const getAccount = (log: Log): Account => ({ name: log.username, date: dateTime(log.time), todo: log.msg });
        const filterLogin = (logs: Log[]): Account[] => filter(log => log.msg === 'login')(logs);
        return <Observable<Account[]>>from(this.apiService.getLog()).pipe(
            rxjsMap(filterLogin),
            rxjsMap(dropRepeatsWith(eqProps('username'))),
            rxjsMap(map(getAccount))
        );
    }
}