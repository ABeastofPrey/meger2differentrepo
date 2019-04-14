import { Component, OnInit, Input, Output } from '@angular/core';
import {EventEmitter} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';

@Component({
  selector: 'io-button',
  templateUrl: './io-button.component.html',
  styleUrls: ['./io-button.component.css'],
  animations: [
    trigger('onOff',[
      state('off',style({
        background: 'red'
      })),
      state('on',style({
        background: 'lime'
      })),
      transition('on <=> off', [
        animate('.2s')
      ]),
    ])
  ]
})
export class IoButtonComponent implements OnInit {
  
  @Input('status') status: boolean;
  @Input('disabled') disabled: boolean;
  @Output('click') onClickEvent: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
  
  onClick(e:MouseEvent) {
    if (this.disabled)
      e.stopImmediatePropagation();
  }

}
