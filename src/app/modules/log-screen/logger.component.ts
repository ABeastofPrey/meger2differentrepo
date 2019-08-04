import { Component, OnInit } from '@angular/core';
import { ApiService, Log } from '../../modules/core/services/api.service';
import { TpStatService } from '../core';

@Component({
  selector: 'logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css'],
})
export class LoggerComponent implements OnInit {
  log: FullLog[];

  constructor(private api: ApiService, public stat: TpStatService) {
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
