import { Component, OnInit} from '@angular/core';
import {MatSliderChange} from '@angular/material';
import {WebsocketService, TpStatService} from '../../../../core';

@Component({
  selector: 'speed-changer',
  templateUrl: './speed-changer.component.html',
  styleUrls: ['./speed-changer.component.css']
})
export class SpeedChangerComponent implements OnInit {
  
  public val : number;

  constructor(
    private stat : TpStatService,
    private ws : WebsocketService
  ) { }

  ngOnInit() { }
  
  ngDoCheck() { this.val = this.stat.velocityRate; }
  
  onChange(event: MatSliderChange) {
    this.ws.query('?tp_speed(' + event.value + ')');
  }

}
