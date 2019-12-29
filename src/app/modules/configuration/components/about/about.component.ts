import { Component, OnInit } from '@angular/core';
import { DataService, WebsocketService, MCQueryResponse } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { UtilsService } from '../../../core/services/utils.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  
  // tslint:disable-next-line: variable-name
  CSVer: string = environment.gui_ver;
  serial: string;
  
  private notifier: Subject<boolean> = new Subject();

  constructor(
    public data: DataService,
    public util: UtilsService,
    private ws: WebsocketService
  ) {}

  ngOnInit() {
    this.ws.isConnected.pipe(takeUntil(this.notifier)).subscribe(stat=>{
      if (!stat) return;
      this.ws.query('?sys.serialnumber').then((ret:MCQueryResponse)=>{
        this.serial = ret.result;
      });
    });
  }
  
  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }
}
