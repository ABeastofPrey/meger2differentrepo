import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.css'],
})
export class ShortcutsComponent implements OnInit {
  shortcuts: Section[] = [
    {
      name: 'help.shortcuts.terminal',
      shortcuts: [
        {
          keys: 'ARROW UP',
          desc: 'help.shortcuts.desc_terminal_up',
        },
        {
          keys: 'ARROW DOWN',
          desc: 'help.shortcuts.desc_terminal_down',
        },
      ],
    },
    {
      name: 'help.shortcuts.editor',
      shortcuts: [
        {
          keys: 'CTRL + F',
          desc: 'help.shortcuts.desc_find',
        },
        {
          keys: 'CTRL + H',
          desc: 'help.shortcuts.desc_replace',
        },
        {
          keys: 'CTRL + L',
          desc: 'help.shortcuts.desc_gotoLine',
        },
        {
          keys: 'CTRL + SPACE / CTRL + SHIFT + SPACE',
          desc: 'help.shortcuts.desc_autocomplete',
        },
        {
          keys: 'CTRL + /',
          desc: 'help.shortcuts.toggle_comment',
        },
        {
          keys: 'F2',
          desc: 'help.shortcuts.fold_unfold',
        },
      ],
    },
    {
      name: 'simulator',
      shortcuts: [
        {
          keys: 'DEL',
          desc: 'help.shortcuts.desc_delete',
        }
      ],
    },
  ];

  constructor() {}

  ngOnInit() {}
}

interface Section {
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string;
  desc: string;
}
