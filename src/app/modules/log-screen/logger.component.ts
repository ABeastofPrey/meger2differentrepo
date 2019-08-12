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
    this.api.getLog().then((ret: Log[]) => {
      this.log = ret.slice(0, 100).map(l=>{
        const l2 = new FullLog(l);
        l2.profilePic = this.api.getProfilePic(l.username);
        return l2;
      });
    });
  }

  ngOnInit() {}
}

class FullLog {
  
  msg: string;
  username: string;
  profilePic: string;
  time: number;
  data: string[];
  
  constructor(log: Log) {
    this.username = log.username;
    this.time = log.time;
    const parts = log.msg.split(';');
    this.msg = parts[0];
    this.data = parts[1] ? parts[1].split(',') : [];
  }
}
