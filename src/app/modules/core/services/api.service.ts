import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {RecordingData} from '../models/rec-data.model';

export const imgPath = environment.api_url + '/blockly/';

export const PERMISSION_ADMIN = 0;
export const PERMISSION_NORMAL = 1;

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) { }
  
  private formatErrors(error: any) {
    return throwError(error.error);
  }
  
  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.api_url}${path}`
    ).pipe(catchError(this.formatErrors));
  }
  
  private get token() {
    return localStorage.getItem('token');
  }
  
  addToProject(fileName:string,programName:string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('fileName', fileName);
    body = body.set('programName', programName);
    return this.http.post(environment.api_url+'/cs/projects/addToProject',body).toPromise();
  }
  
  createProject(fileName:string) {
    let body = new HttpParams();
    body = body.set('token',this.token);
    body = body.set('fileName', fileName);
    return this.http.post(environment.api_url+'/cs/projects/new',body).toPromise();
  }
  
  deleteProject(name : string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.delete(environment.api_url + '/cs/projects/' + name, {params:body})
      .toPromise();
  }
  
  deleteFileFromProject(projectName : string, fileName:string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('projectName', projectName);
    body = body.set('fileName', fileName);
    return this.http.delete(environment.api_url + '/cs/projects/file/',{params:body}).toPromise();
  }
  
  upload(file : File, overwrite : boolean) {
    let url = environment.api_url + '/cs/upload';
    if (overwrite)
      url += '/overwrite';
    let formData = new FormData();
    formData.append('token', this.token);
    formData.append('file', file);
    return this.http.post(url,formData).toPromise();
  }
  
  uploadIPK(file: File) {
    const url = environment.api_url + '/cs/firmware';
    let formData = new FormData();
    formData.append('token', this.token);
    formData.append('file', file);
    return this.http.post(url,formData).toPromise();
  }
  
  uploadProfilePic(file:File, username: string) {
    let url = environment.api_url + '/cs/api/' + username + '/pic?token='
      + localStorage.getItem('jwtToken');
    let formData = new FormData();
    formData.append('file', file);
    return this.http.post(url,formData).toPromise();
  }
  
  getProfilePic(username: string) {   
    return environment.api_url + '/cs/api/' + username + '/pic?token='
      + localStorage.getItem('jwtToken');
  }
  
  getFiles(extensions?:string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    body = body.set('asJSON', 'true');
    if (extensions)
      body = body.set('ext', extensions);
    return this.http.get<MCFile[]>(environment.api_url + '/cs/files', {params: body})
      .toPromise();
  }
  
  getFile(name: string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.get(environment.api_url+'/cs/file/'+name,{
      responseType:'text',
      params: body
    }).toPromise();
  }
  
  downloadZip(files : string[]) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    if (files)
      body = body.set('files', files.join());
    this.http.get(environment.api_url + '/cs/mczip',{params:body})
    .subscribe(ret=>{
      if (ret)
        window.location.href = 'http://' + environment.ip + '/MCFiles.zip';
    });
  }
  
  deleteFile(name : string) {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.delete(environment.api_url + '/cs/file/' + name, {params:body})
      .toPromise();
  }
  
  getSysInfo() {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.get(environment.api_url + '/cs/api/sysinfo', {params:body}).toPromise();
  }
  
  getTRNERR() {
    let body = new HttpParams();
    body = body.set('token', this.token);
    return this.http.get(environment.api_url + '/cs/trnerr', {params:body, responseType:'text'})
      .toPromise();
  }
  
  getUsers() {
    return this.get('/cs/api/users').toPromise();
  }
  
  getMCKeywords() {
    return this.http.get(environment.api_url + '/cs/MCCommands/all',{responseType:'text'})
      .toPromise();
  }
  
  getMCProperties() {
    return this.http.get(environment.api_url + '/cs/MCCommands').toPromise();
  }
  
  getDocs() {
    return this.get('/cs/docs').toPromise();
  }
  
  signup(username : string, password: string, fullName:string, permission: number) {
    const user = {
      username: username,
      password: password,
      fullName: fullName,
      permission: permission.toString()
    };
    return this.http.post(environment.api_url + '/cs/api/signup',user)
      .toPromise();
  }
  
  deleteUser(username : string) {
    return this.http.delete(environment.api_url + '/cs/api/user/' + username)
      .toPromise();
  }
  
  getUserPermission(permission:number) {
    switch (permission) {
      case PERMISSION_ADMIN:
        return 'Administrator';
      case PERMISSION_NORMAL:
        return 'softMC User';
    }
  }
  
  getLog() {
    return this.get('/cs/api/log').toPromise();
  }
  
  getRecordingCSV(recName : string) {
    let body = new HttpParams();
    let rec = recName || 'CSRECORD';
    return this.get('/cs/api/dashboard/rec/'+rec).toPromise().then((csv:RecordingData)=>{
        return csv.data.replace(/\0/g,''); // REMOVE NULL CHARACTERS
    },()=>{
      return null;
    });
  }

}


export interface MCFile {
  fileName: string;
  modified: number;
  fileNameOnly: string;
  extension : string;
}

export interface UploadResult {
  success : boolean;
  err : number;
}

export interface Log {
  username: string;
  time: number;
  msg : string;
}
