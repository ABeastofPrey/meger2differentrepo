import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NotificationService } from '../../../../modules/core/services/notification.service';
import { LoginService, ScreenManagerService } from '../../../core';
import { ErrorFrame } from '../../../core/models/error-frame.model';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';

@Component({
  selector: 'notification-window',
  templateUrl: './notification-window.component.html',
  styleUrls: ['./notification-window.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class NotificationWindowComponent implements OnInit {
  @ViewChild('wrapper', { static: false }) msgContainer: ElementRef;

  style: object = {};
  contextMenuShown = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextSelection: string = null;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public notification: NotificationService,
    public login: LoginService,
    private mgr: ScreenManagerService,
    private prg: ProgramEditorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.notification.newMessage
      .pipe(takeUntil(this.notifier))
      .subscribe(() => {
        const objDiv = this.msgContainer.nativeElement;
        objDiv.scrollTop = objDiv.scrollHeight;
      });
  }

  ngOnDestroy() {
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  onContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.contextMenuX = e.offsetX + 8;
    this.contextMenuY = e.offsetY + 8;
    this.contextMenuShown = true;
    this.contextSelection = this.getSelection();
  }

  private getSelection(): string {
    let t: string = null;
    if (window.getSelection) {
      t = window.getSelection().toString();
    } else if (
      document.getSelection &&
      document.getSelection().type !== 'Control'
    ) {
      t = document.getSelection().toString();
    }
    return t && t.trim().length > 0 ? t : null;
  }

  copy() {
    document.execCommand('copy');
    this.contextMenuShown = false;
    this.contextSelection = null;
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
    const fileName = err.errTask.substring(err.errTask.lastIndexOf('/') + 1);
    this.mgr.screen = this.mgr.screens[2];
    this.router.navigateByUrl('/projects');
    this.prg.setFile(fileName, path, null, -1);
    this.prg.mode = 'editor';
    this.notification.toggleWindow();
  }
}
