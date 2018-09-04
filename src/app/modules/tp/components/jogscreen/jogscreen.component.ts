import { Component, OnInit } from '@angular/core';
import {trigger,state,style,animate,transition} from '@angular/animations';
import {WebsocketService, DataService, TeachService} from '../../../core';

@Component({
  selector: 'jog-screen',
  templateUrl: './jogscreen.component.html',
  styleUrls: ['./jogscreen.component.css'],
  animations: [
    trigger('menuState', [
      state('Teach', style({
        backgroundColor: '#3F51B5'
      })),
      state('Tool Align',   style({
        backgroundColor: '#558B2F'
      })),
      transition('* => *', animate('500ms ease-in'))
    ]),
    trigger('menuContent', [
      state('Teach', style({
        transform: 'translateX(0)'
      })),
      state('Tool Align',   style({
        transform: 'translateX(-33%)'
      })),
      transition('* => *', animate('400ms ease-in'))
    ])
  ]
})
export class JogScreenComponent implements OnInit {
  
  public menuTypes: MenuType[] = [];
  public selectedMenuTypeIndex : number = 0;
  public isTeachMenuOpen : boolean = false;

  constructor(
    public data : DataService,
    public teach : TeachService,
    private ws : WebsocketService,
  ) {
    this.menuTypes.push(new MenuType('Teach','touch_app'));
    this.menuTypes.push(new MenuType('Tool Align','vertical_align_bottom'));
  }
  
  ngOnInit(): void {
    //this.data.refreshTools();
  }
  
  onChange(index : number) {
    this.selectedMenuTypeIndex = index;
  }  
  
  onTeachMenuOpen(isOpen: boolean) {
    this.isTeachMenuOpen = isOpen;
  }
  
  align() {
    //this.ws.send('?TP_Align("PITCH")');
  }
  
  stop() {
    //this.ws.send('?TP_STOP');
  }
}

class MenuType {
  name: string;
  icon: string;
  
  constructor(name,icon) {
    this.name = name;
    this.icon = icon;
  }
}