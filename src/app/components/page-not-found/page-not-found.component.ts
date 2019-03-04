import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private _location: Location) { }
  
  public env = environment;
  
  back() {
    this._location.back();
  }

  ngOnInit() {
  }

}
