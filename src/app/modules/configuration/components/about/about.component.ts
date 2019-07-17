import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core';
import { environment } from '../../../../../environments/environment';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  CSVer: string = environment.gui_ver;

  constructor(public data: DataService, public util: UtilsService) {}

  ngOnInit() {}
}
