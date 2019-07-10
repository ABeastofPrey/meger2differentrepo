import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-license-dialog',
  templateUrl: './license-dialog.component.html',
  styleUrls: ['./license-dialog.component.css'],
})
export class LicenseDialogComponent implements OnInit {
  license: string = null;

  @ViewChild('container', { static: false }) container: HTMLElement;

  constructor(private http: HttpClient, private ref: MatDialogRef<any>) {}

  ngOnInit() {
    this.http
      .get('assets/license/stx.html', { responseType: 'text' })
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
