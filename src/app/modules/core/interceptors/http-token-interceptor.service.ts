import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler} from '@angular/common/http';
import {Observable} from 'rxjs';
import {HttpEvent} from '@angular/common/http';
import {JwtService} from '../services/jwt.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const picUpload = req.url.indexOf('/pic?') > 0 && req.method === 'POST';
    const fileUpload = req.url.indexOf('/upload') > 0 && req.method === 'POST';
    const trnErr = req.url.indexOf('/trnerr') > 0 && req.method === 'GET';
    const ipkUpload = req.url.indexOf('/firmware') > 0 && req.method === 'POST';
    const zipOperation = req.url.indexOf('zip') > 0;
    const verifyProject = req.url.indexOf('/verifyProject') > 0;
    const palletUpload = req.url.indexOf('/pallet/') > 0 && req.method === 'POST';
    const headersConfig = (
      picUpload || fileUpload || trnErr || ipkUpload || zipOperation || 
      palletUpload || verifyProject
    ) ? {} : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = this.jwtService.getToken();
    if (token) {
      headersConfig['Authorization'] = `Token ${token}`;
    }
    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }
  constructor(private jwtService: JwtService) { }
}
