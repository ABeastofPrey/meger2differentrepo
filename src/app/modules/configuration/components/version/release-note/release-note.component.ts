import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-release-note',
  templateUrl: './release-note.component.html',
  styleUrls: ['./release-note.component.scss'],
})
export class ReleaseNoteComponent implements OnInit {
  releaseNote: string = null;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get(`${environment.api_url}/cs/file/RELEASENOTE.DAT`, {
        responseType: 'text',
      })
      .subscribe(res => {
        this.releaseNote = res;
      });
  }
}
