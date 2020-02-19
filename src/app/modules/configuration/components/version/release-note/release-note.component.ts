import { ApiService } from './../../../../core/services/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-release-note',
  templateUrl: './release-note.component.html',
  styleUrls: ['./release-note.component.scss'],
})
export class ReleaseNoteComponent implements OnInit {
  releaseNote: string = null;
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getKukaReleaseNotes().subscribe(res => {
      this.releaseNote = res;
    });
  }
}
