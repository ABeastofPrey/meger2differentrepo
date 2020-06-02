import { ErrorFrame } from './../../modules/core/models/error-frame.model';
import { ProgramEditorService } from './../../modules/program-editor/services/program-editor.service';
import { ScreenManagerService } from './../../modules/core/services/screen-manager.service';
import { LoginService } from './../../modules/core/services/login.service';
import { NotificationService } from './../../modules/core/services/notification.service';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FwTranslatorService } from './../../modules/core/services/fw-translator.service';

const MIN_REFRESH_RATE = 200;

@Component({
  selector: 'message-log',
  templateUrl: './message-log.component.html',
  styleUrls: ['./message-log.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class MessageLogComponent implements OnInit {

  @ViewChild('wrapper', { static: false }) msgContainer: CdkVirtualScrollViewport;

  style: object = {};
  contextMenuShown = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextSelection: string = null;

  private notifier: Subject<boolean> = new Subject();
  private last = 0;

  constructor(
    public notification: NotificationService,
    public login: LoginService,
    private mgr: ScreenManagerService,
    private prg: ProgramEditorService,
    private cd: ChangeDetectorRef,
    public trn: FwTranslatorService,
    private router: Router) { }

    ngOnInit() {
      this.notification.newMessage
        .pipe(takeUntil(this.notifier))
        .subscribe(() => {
          const now = new Date().getTime();
          const diff = now - this.last;
          if (diff < MIN_REFRESH_RATE) return;
          this.last = now;
          this.cd.detectChanges();
          this.msgContainer.scrollToIndex(this.msgContainer.getDataLength());
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
      this.cd.detectChanges();
    }
  
    goToError(err: ErrorFrame) {
      let path = err.errTask.substring(11);
      path = path.substring(0, path.lastIndexOf('/')) + '/';
      const fileName = err.errTask.substring(err.errTask.lastIndexOf('/') + 1);
      this.mgr.screen = this.mgr.screens[2];
      this.prg.modeToggle = 'mc';
      this.prg.mode = 'editor';
      this.router.navigateByUrl('/projects');
      this.prg.setFile(fileName, path, null, -1);
    }

    public firstPortion: string;
    public secondPortion: string;
    public thirdPortioin: string;
    public libLogcode: number;

    public isLibLog(msg: string): boolean {
      if (typeof msg !== 'string' || msg.trim() === '') {
        return false;
      }
      const strIdx = msg.indexOf(':') + 1;
      const endIdx = msg.indexOf(',');
      const logCode = parseInt(msg.slice(strIdx, endIdx).trim());
      const isLibLog = errCode => errCode >= 20000 && errCode <= 20999;
      this.libLogcode = logCode;
      this.recombinateLibMsg(msg);
      return isLibLog(logCode);
    }

    private recombinateLibMsg(oriMsg: string): void {
      const strIdx = oriMsg.indexOf('"') + 1;
      this.firstPortion = oriMsg.slice(0, strIdx);
      const endIdx = oriMsg.slice(strIdx).indexOf('"');
      this.thirdPortioin = oriMsg.slice(strIdx + endIdx);
      this.secondPortion = oriMsg.slice(strIdx, strIdx + endIdx);
    }
}