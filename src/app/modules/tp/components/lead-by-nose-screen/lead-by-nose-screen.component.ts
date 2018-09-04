import { Component, OnInit } from '@angular/core';
import {LeadByNoseServiceService, DataService, TeachService} from '../../../core';

@Component({
  selector: 'lead-by-nose-screen',
  templateUrl: './lead-by-nose-screen.component.html',
  styleUrls: ['./lead-by-nose-screen.component.css']
})
export class LeadByNoseScreenComponent implements OnInit {

  constructor(
      public data : DataService,
      public lbn : LeadByNoseServiceService,
      public teach : TeachService
  ){

  }

  ngOnInit() {
   this.lbn.init();
  }

}
