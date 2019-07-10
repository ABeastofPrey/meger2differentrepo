import { Component, OnInit } from '@angular/core';
import { ApiService, Log } from '../../modules/core/services/api.service';

@Component({
  selector: 'logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css'],
})
export class LoggerComponent implements OnInit {
  log: FullLog[];

  constructor(private api: ApiService) {
    this.api.getLog().then((ret: FullLog[]) => {
      this.log = ret.slice(0, 100);
      for (let l of this.log) {
        l.profilePic = this.api.getProfilePic(l.username);
      }
    });
  }

  ngOnInit() {}
}

interface FullLog extends Log {
  profilePic: string;
}
