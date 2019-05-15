import { Component, OnInit} from '@angular/core';
import {MatSliderChange, MatSelectChange} from '@angular/material';
import {WebsocketService, TpStatService, DataService} from '../../../../core';
import {Input} from '@angular/core';

@Component({
  selector: 'speed-changer',
  templateUrl: './speed-changer.component.html',
  styleUrls: ['./speed-changer.component.css']
})
export class SpeedChangerComponent implements OnInit {
  
  public val : number;
  @Input('disabled') disabled: boolean;

  constructor(
    private stat : TpStatService,
    private ws : WebsocketService,
    public data: DataService
  ) { }

  ngOnInit() { }
  
  ngDoCheck() {
    this.val = this.stat.velocityRate;
  }
  
  onChange(event: MatSliderChange) {
    this.ws.query('?tp_set_jog_vrate(' + event.value + ')');
  }
  
  onIncChange(event: MatSelectChange) {
    this.data.jogIncrements = event.value;
  }

}
