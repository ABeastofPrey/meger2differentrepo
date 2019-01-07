import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.css']
})
export class ShortcutsComponent implements OnInit {
  
  shortcuts: Section[] = [
    {
      name: 'Terminal',
      shortcuts: [
        {
          keys: 'ARROW UP',
          desc: 'Go to previous command'
        },
        {
          keys: 'ARROW DOWN',
          desc: 'Go to next command'
        }
      ]
    },
    {
      name: 'Program Editor',
      shortcuts: [
        {
          keys: 'CTRL + F',
          desc: 'Find'
        },
        {
          keys: 'CTRL + H',
          desc: 'Replace'
        },
        {
          keys: 'CTRL + SPACE',
          desc: 'Show Autocomplete options'
        }
      ]
    },
    {
      name: 'Simulator',
      shortcuts: [
        {
          keys: 'DEL',
          desc: 'Delete selected object'
        },
        {
          keys: 'CTRL + D',
          desc: 'Duplicate selected object'
        }
      ]
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}

interface Section {
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string;
  desc: string;
}
