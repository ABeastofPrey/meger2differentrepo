import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {NotificationService} from '../../../../modules/core/services/notification.service';
import {LoginService, ScreenManagerService} from '../../../core';
import {ErrorFrame} from '../../../core/models/error-frame.model';
import {ProgramEditorService} from '../../../program-editor/services/program-editor.service';
import {Router} from '@angular/router';
import {trigger, transition, style, animate} from '@angular/animations';

@Component({
  selector: 'notification-window',
  templateUrl: './notification-window.component.html',
  styleUrls: ['./notification-window.component.css'],
  animations: [
    trigger('fade',[
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationWindowComponent implements OnInit {
  
  @ViewChild('wrapper') msgContainer: ElementRef;
  
  style: object = {};
  contextMenuShown : boolean = false;
  contextMenuX : number = 0;
  contextMenuY : number = 0;

  constructor(
    public notification:NotificationService,
    public login: LoginService,
    private mgr: ScreenManagerService,
    private prg: ProgramEditorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.notification.newMessage.subscribe(()=>{
      const objDiv = this.msgContainer.nativeElement;
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  }
  
  onContextMenu(e:MouseEvent) {
    e.preventDefault();
    this.contextMenuX = e.offsetX;
    this.contextMenuY = e.offsetY + 72;
    this.contextMenuShown = true;
  }
  
  onClick() {
    this.contextMenuShown = false;
  }
  
  clear() {
    this.notification.clear();
    this.contextMenuShown = false;
  }
  
  goToError(err: ErrorFrame) {
    let path = err.errTask.substring(11);
    path = path.substring(0, path.lastIndexOf('/')) + '/';
    const fileName = err.errTask.substring(err.errTask.lastIndexOf('/')+1);
    this.mgr.screen = this.mgr.screens[2];
    this.router.navigateByUrl('/projects');
    this.prg.setFile(fileName,path,null);
    this.prg.mode = 'editor';
    this.notification.toggleWindow();
  }

}
