import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { DataService, TeachService, LoginService } from '../../../core';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../../core/services/utils.service';

@Component({
  selector: 'jog-screen',
  templateUrl: './jogscreen.component.html',
  styleUrls: ['./jogscreen.component.css'],
  animations: [
    trigger('menuState', [
      state(
        'Teach',
        style({
          backgroundColor: '#3F51B5',
        })
      ),
      state(
        'Tool Align',
        style({
          backgroundColor: '#558B2F',
        })
      ),
      state(
        'Tool Align KUKA',
        style({
          backgroundColor: '#ff7300',
        })
      ),
      transition('* => *', animate('500ms ease-in')),
    ]),
    trigger('menuContent', [
      state(
        'Teach',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'Tool Align',
        style({
          transform: 'translateX(-33%)',
        })
      ),
      transition('* => *', animate('400ms ease-in')),
    ]),
  ],
})
export class JogScreenComponent implements OnInit {
  public menuTypes: MenuType[];
  public selectedMenuTypeIndex: number = 0;
  public isTeachMenuOpen: boolean = false;

  constructor(
    public data: DataService,
    public teach: TeachService,
    private trn: TranslateService,
    private utils: UtilsService,
    public login: LoginService
  ) {
    this.trn.get('jogScreen.menu').subscribe(words => {
      this.menuTypes = [];
      if (this.utils.IsKuka) {
        this.menuTypes.push(
          new MenuType('Tool Align KUKA', 'touch_app', words[0])
        );
      }

      if (!this.utils.IsKuka) {
        this.menuTypes.push(new MenuType('Tool Align', 'touch_app', words[0]));
      }
      this.menuTypes.push(
        new MenuType('Teach', 'vertical_align_bottom', words[1])
      );
    });
  }

  ngOnInit(): void {}

  onChange(index: number) {
    this.selectedMenuTypeIndex = index;
  }

  onTeachMenuOpen(isOpen: boolean) {
    this.isTeachMenuOpen = isOpen;
  }

  align() {}

  stop() {}
}

class MenuType {
  name: string;
  icon: string;
  i18: string;

  constructor(name: string, icon: string, i18: string) {
    this.name = name;
    this.icon = icon;
    this.i18 = i18;
  }
}
