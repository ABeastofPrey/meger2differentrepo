import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment as env } from '../../../environments/environment';
import { from, combineLatest } from 'rxjs';
import { CommonService } from '../../modules/core/services/common.service';

@Component({
  selector: 'app-license-dialog',
  templateUrl: './license-dialog.component.html',
  styleUrls: ['./license-dialog.component.css'],
})
export class LicenseDialogComponent implements OnInit {

  license: string | null = null;
  useInKukaAbout = false;

  @ViewChild('container', { static: false }) container?: ElementRef<HTMLElement>;

  constructor(
    private http: HttpClient,
    private ref: MatDialogRef<boolean>,
    private common: CommonService,
    @Inject(MAT_DIALOG_DATA) public data?: {
      useInKukaAbout: boolean
    }
  ) {
    if (data && data.useInKukaAbout) {
      this.useInKukaAbout = true;
    }
  }

  ngOnInit() {
    const isKuka = env.platform.name === env.platforms.Kuka.name;
    const fileName = isKuka ? 'kuka.html' : 'stx.html';
      combineLatest([
        this.http.get(`assets/license/${fileName}`, { responseType: 'text' }),
        from(import('../../../assets/config/common-config.json'))
      ]).subscribe(([content, { license_url }]) => {
        this.license = content;
        setTimeout(() => {
          const href = isKuka ? license_url.kuka : license_url.stx;
          let urlEle;
          if (this.common.isTablet) {
            urlEle = document.createElement('span');
            urlEle.setAttribute('style', 'color:rgba(0, 0, 0, 0.6); border-bottom: 1px solid rgba(0, 0, 0, 0.6);');
            urlEle.innerHTML = href;
          } else {
            urlEle = document.createElement('a');
            urlEle.href = href;
            urlEle.target = "_blank";
            urlEle.innerHTML = href;
          }
          this.container.nativeElement.appendChild(urlEle);
          this.container.nativeElement.scrollTop = 0;
        }, 0);
      });
  }

  accept() {
    this.ref.close(true);
  }
}
