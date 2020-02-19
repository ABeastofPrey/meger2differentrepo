import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RecordingData } from '../models/rec-data.model';

export const PERMISSION_ADMIN = 0;
export const PERMISSION_PROGRAMMER = 1;
export const PERMISSION_OPERATOR = 2;
export const PERMISSION_VIEWER = 3;
export const PERMISSION_SUPER = 99;

@Injectable()
export class ApiService {
  private picReq = 0;

  profilePicChanged: EventEmitter<void> = new EventEmitter();

  constructor(
    private http: HttpClient
  ) { }

  private formatErrors(error: { error: Error }) {
    return throwError(error.error);
  }

  get api_url() {
    if (!environment.production) {
      return environment.api_url;
    }
    return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<{}> {
    return this.http
      .get(`${this.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: {} = {}): Observable<{}> {
    return this.http
      .put(`${this.api_url}${path}`, JSON.stringify(body))
      .pipe(catchError(this.formatErrors));
  }

  post(path: string, body: {} = {}): Observable<{}> {
    return this.http
      .post(`${this.api_url}${path}`, JSON.stringify(body))
      .pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<{}> {
    return this.http
      .delete(`${this.api_url}${path}`)
      .pipe(catchError(this.formatErrors));
  }

  private get token() {
    return window.localStorage['jwtToken'];
  }

  confirmPass(username: string, pass: string) {
    return this.post('/cs/api/users', {
      user: {
        username,
        password: pass,
      },
    })
      .toPromise()
      .then(
        ret => {
          return true;
        },
        err => {
          return false;
        }
      );
  }

  upload(file: File, overwrite: boolean) {
    let url = this.api_url + '/cs/upload';
    if (overwrite) url += '/overwrite';
    const formData = new FormData();
    formData.append('token', this.token);
    formData.append('file', file);
    return this.http.post(url, formData).toPromise();
  }

  uploadToDrive(file: File, ip: string) {
    const url = this.api_url + '/drive/api/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ip', ip);
    return this.http.post(url, formData).toPromise();
  }

  uploadToPath(file: File, overwrite: boolean, path: string) {
    const url = this.api_url + '/cs/api/upload';
    const formData = new FormData();
    formData.append('file', file);
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('path', path);
    if (overwrite) body = body.set('overwrite', 'true');
    return this.http.post(url, formData, { params: body }).toPromise();
  }

  uploadRec(file: File) {
    const url = this.api_url + '/cs/api/uploadRec';
    const formData = new FormData();
    formData.append('file', file);
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.post(url, formData, { params: body }).toPromise();
  }

  uploadIPK(file: File) {
    const url = this.api_url + '/cs/firmware';
    const formData = new FormData();
    formData.append('token', this.token);
    formData.append('file', file);
    return this.http.post(url, formData).toPromise();
  }

  verifyProject(file: File) {
    const url = this.api_url + '/cs/api/verifyProject';
    const formData = new FormData();
    formData.append('token', this.token);
    formData.append('file', file);
    return this.http.post(url, formData).toPromise();
  }

  importProject(fileName: string) {
    const url = this.api_url + '/cs/api/importProject';
    const body = new HttpParams().set('fileName', fileName);
    return this.http.get(url, { params: body }).toPromise();
  }

  deleteProjectZip(fileName: string) {
    const url = this.api_url + '/cs/api/projectZip';
    const body = new HttpParams().set('fileName', fileName);
    return this.http.delete(url, { params: body }).toPromise();
  }

  uploadProfilePic(file: File, username: string) {
    const url =
      this.api_url +
      '/cs/api/' +
      username +
      '/pic?token=' +
      localStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(url, formData).toPromise();
  }

  refreshProfilePic() {
    this.picReq++;
    this.profilePicChanged.emit();
  }

  getProfilePic(username: string) {
    //return 'assets/pics/logo_cs.png';
    return (
      this.api_url +
      '/cs/api/' +
      username +
      '/pic?token=' +
      localStorage.getItem('jwtToken') +
      '&d=' +
      this.picReq
    );
  }

  getFiles(extensions?: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('asJSON', 'true');
    if (extensions) body = body.set('ext', extensions);
    return this.http
      .get<MCFile[]>(this.api_url + '/cs/files', { params: body })
      .toPromise();
  }

  getFile(name: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http
      .get(this.api_url + '/cs/file/' + name, {
        responseType: 'text',
        params: body,
      })
      .toPromise();
  }

  getKukaReleaseNotes() {
    return this.http.get(this.api_url + '/cs/file/RELEASENOTE.DAT',{
      responseType: 'text'
    });
  }

  getPathFile(path: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('path', path);
    return this.http
      .get(this.api_url + '/cs/path', {
        responseType: 'text',
        params: body,
      })
      .toPromise();
  }

  getPkgdResult() {
    return this.http.get(this.api_url + '/cs/api/pkgd').toPromise();
  }

  downloadZip(files: string[]) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    if (files) {
      body = body.set('files', files.join());
    }
    return this.http
      .post(this.api_url + '/cs/mczip', body)
      .toPromise()
      .then(ret => {
        if (ret) window.location.href = this.api_url + '/cs/api/zipFile';
      });
  }

  downloadProjectZip(project: string) {
    const url =
      this.api_url + '/cs/api/zipProject/' + project.toUpperCase();
    return this.http
      .get(url, { responseType: 'arraybuffer' })
      .toPromise()
      .then(ret => {
        const blob = new Blob([ret], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = project.toUpperCase() + '.ZIP';
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }

  downloadSysZip() {
    window.location.href = this.api_url + '/cs/api/zipSysFile';
  }

  deleteFile(name: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http
      .delete(this.api_url + '/cs/file/' + name, { params: body })
      .toPromise();
  }

  deleteFolder(name: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http
      .delete(this.api_url + '/cs/file/' + name, { params: body })
      .toPromise();
  }

  getSysInfo() {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http
      .get(this.api_url + '/cs/api/sysinfo', { params: body })
      .toPromise();
  }

  getTRNERR() {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http
      .get(this.api_url + '/cs/trnerr', {
        params: body,
        responseType: 'text',
      })
      .toPromise();
  }

  getUsers() {
    return this.get('/cs/api/users').toPromise();
  }

  getTheme() {
    return this.get('/cs/api/theme')
      .toPromise()
      .then((ret: { theme: string }) => {
        return ret ? ret.theme : 'kuka';
      });
  }

  setTheme(theme: string) {
    return this.put('/cs/api/theme/' + theme).toPromise();
  }

  getMCKeywords() {
    return this.http
      .get(this.api_url + '/cs/MCCommands/all', { responseType: 'text' })
      .toPromise();
  }

  getMCProperties() {
    return this.http.get(this.api_url + '/cs/MCCommands').toPromise();
  }

  getDocs() {
    return this.get('/cs/docs').toPromise();
  }

  signup(
    username: string,
    password: string,
    fullName: string,
    permission: number
  ) {
    const user = {
      username,
      password,
      fullName,
      permission: permission.toString(),
    };
    return this.http
      .post(this.api_url + '/cs/api/signup', user)
      .toPromise();
  }

  editUser(
    username: string,
    password: string,
    fullName: string,
    permission: number
  ) {
    const user = {
      username,
      password,
      fullName,
      permission: permission.toString(),
    };
    return this.http
      .put(this.api_url + '/cs/api/user', user)
      .toPromise();
  }

  deleteUser(username: string) {
    return this.http
      .delete(this.api_url + '/cs/api/user/' + username)
      .toPromise();
  }

  getUserPermission(permission: number) {
    switch (permission) {
      case PERMISSION_ADMIN:
        return 'Administrator';
      case PERMISSION_PROGRAMMER:
        return 'Programmer';
      case PERMISSION_OPERATOR:
        return 'Operator';
      case PERMISSION_VIEWER:
        return 'Viewer';
      case PERMISSION_SUPER:
        return 'System Supervisor';
      default:
        return '';
    }
  }

  getLog() {
    return this.get('/cs/api/log').toPromise();
  }

  /* Clears the Webserver LOG */
  clearLog() {
    return this.get('/cs/api/logClear').toPromise();
  }

  getRecordingFiles() {
    return this.get('/cs/api/dashboard/recfiles')
      .toPromise()
      .then((ret: string[]) => {
        return ret.map(s => {
          return s.split('.')[0];
        });
      });
  }
  
  getRecordingFile(recName: string) {
    const url = this.api_url + '/cs/api/dashboard/recFile/' + recName;
    return this.http
      .get(url, { responseType: 'arraybuffer' })
      .toPromise()
      .then(ret => {
        const blob = new Blob([ret], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = recName + '.REC';
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
    
  }

  getRecordingCSV(recName: string) {
    const rec = recName || 'CSRECORD';
    return this.get('/cs/api/dashboard/rec/' + rec)
      .toPromise()
      .then(
        (csv: RecordingData) => {
          return csv.data.replace(/\0/g, '').slice(0, -1); // REMOVE NULL CHARACTERS
        },
        () => {
          return null;
        }
      )
      .catch(ret => {
        return null;
      });
  }

  createPalletFile(data: string, fileName: string) {
    let body = new HttpParams();
    body = body.set('palletData', data);
    if (fileName) {
      body = body.set('fileName', fileName);
    }
    return this.http
      .post(this.api_url + '/tp/pallet/', body, {
        responseType: 'text',
      })
      .toPromise();
  }

  updatePalletFile(name: string, data: string) {
    let body = new HttpParams();
    body = body.set('palletData', data);
    return this.http
      .post(this.api_url + '/tp/pallet/' + name, body)
      .toPromise();
  }

  createFolder(path: string): Promise<boolean> {
    const url = this.api_url + '/cs/api/folder';
    return this.http.post(url, { path }).toPromise() as Promise<boolean>;
  }

  moveFiles(files: string, target: string): Promise<boolean> {
    const url = this.api_url + '/cs/api/move';
    return (
      this.http.post(url, { files, target }).toPromise()
    ) as Promise<boolean>;
  }

  restoreToFactory() {
    const url = this.api_url + '/cs/api/factoryRestore';
    return this.http.get(url).toPromise() as Promise<boolean>;
  }

  bugReport(info: string, user: string, history: string) {
    const url = this.api_url + '/cs/api/bugreport';
    return this.http
      .post(url, {
        user,
        info,
        history,
      })
      .toPromise() as Promise<boolean>;
  }

  copy(fromPath: string, to: string) {
    const url = this.api_url + '/cs/api/copy';
    return this.http
      .post(url, {
        from: fromPath,
        to,
      })
      .toPromise() as Promise<boolean>;
  }
}

export interface MCFile {
  fileName: string;
  modified: number;
  fileNameOnly: string;
  extension: string;
}

export interface UploadResult {
  success: boolean;
  err: number;
}

export interface Log {
  username: string;
  time: number;
  msg: string;
  UUID: string;
}

export interface ProjectVerificationResult {
  success: boolean;
  project: string;
  file: string;
}
