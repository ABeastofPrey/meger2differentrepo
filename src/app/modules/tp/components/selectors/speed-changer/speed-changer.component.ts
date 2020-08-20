import { Component, OnInit, HostListener } from '@angular/core';
import { MatSliderChange, MatSelectChange } from '@angular/material';
import { WebsocketService, TpStatService, DataService } from '../../../../core';
import { Input } from '@angular/core';

@Component({
  selector: 'speed-changer',
  templateUrl: './speed-changer.component.html',
  styleUrls: ['./speed-changer.component.css'],
})
export class SpeedChangerComponent implements OnInit {

  val = 0;
  @Input('disabled') disabled?: boolean;

  private tmpVal = 0;
  private isPressed = false;

  constructor(
    private stat: TpStatService,
    private ws: WebsocketService,
    public data: DataService
  ) {}

  ngOnInit() {}

  ngDoCheck() {
    this.val = this.stat.velocityRate;
  }
  
  getDisplayVal(value: number) {
    return value === 0 ? 0.1 : value;
  }

  onChange(event: MatSliderChange) {
    this.tmpVal = event.value;
    console.log(this.tmpVal);
  }

  @HostListener('window:mouseup')
  onmouseup() {
    if (!this.isPressed) return;
    this.ws.query('?tp_set_jog_vrate(' + this.tmpVal + ')');
    this.isPressed = false;
  }

  onMouseDown() {
    this.isPressed = true;
  }

  onIncChange(event: MatSelectChange) {
    this.data.jogIncrements = event.value;
  }
}
