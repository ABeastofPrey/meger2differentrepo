import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment as env } from '../../../environments/environment';

@Component({
  selector: 'app-license-dialog',
  templateUrl: './license-dialog.component.html',
  styleUrls: ['./license-dialog.component.css'],
})
export class LicenseDialogComponent implements OnInit {

  license: string | null = null;
  useInKukaAbout = false;

  @ViewChild('container', { static: false }) container?: HTMLElement;

  constructor(
    private http: HttpClient,
    private ref: MatDialogRef<boolean>,
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
    this.http
      .get(`assets/license/${fileName}`, { responseType: 'text' })
      .subscribe(text => {
        this.license = text;
        setTimeout(() => {
          this.container.scrollTop = 0;
        }, 0);
      });
  }

  accept() {
    this.ref.close(true);
  }
}
