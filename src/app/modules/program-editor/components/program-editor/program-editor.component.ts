import { TerminalService } from './../../../home-screen/services/terminal.service';
import { UtilsService } from './../../../core/services/utils.service';
import { NotificationService } from './../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import {
  ProgramEditorService
} from '../../services/program-editor.service';
import {
  DataService,
  ProjectManagerService,
  LoginService,
  WebsocketService,
} from '../../../core';
import { CommonService } from '../../../core/services/common.service';
import { projectPoints } from '../program-editor-side-menu/program-editor-side-menu.component';
import {environment} from '../../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.scss'],
})
export class ProgramEditorComponent implements OnInit {

  // GUTTER VISIBLITY
  showGutterLeft = true;
  showGutterRight = true;
  
  pPoints = projectPoints;
  env = environment;
  selectedTab = 0;

  private notifier: Subject<boolean> = new Subject();

  constructor(
    public service: ProgramEditorService,
    public data: DataService,
    public prj: ProjectManagerService,
    public login: LoginService,
    public cmn: CommonService,
    private ws: WebsocketService,
    public notification: NotificationService,
    public utils: UtilsService,
    private terminal: TerminalService
  ) {}

  ngOnInit() {
    // when errors happen jump to first tab
    this.service.errLinesChange.pipe(takeUntil(this.notifier)).subscribe(lines => {
      this.selectedTab = 0;
    });

    
  }

  ngOnDestroy() {
    this.service.mode = 'editor';
    if (this.notification.messagesShowing) {
      this.notification.toggleMessagesShowing(false);
    }
    this.notifier.next(true);
    this.notifier.unsubscribe();
  }

  toggleGutter(i: number) {
    if (i === 1) {
      this.showGutterLeft = !this.showGutterLeft;
    } else if (i === 2) {
      this.showGutterRight = !this.showGutterRight;
    }
  }

  onDragEnd() {
    this.service.onDragEnd();
    this.terminal.resizeRequired.emit();
  }

  

  onTabChange(i: number) {
    this.selectedTab = i;
    if (i === 2) {
      setTimeout(()=>{
        this.terminal.resizeRequired.emit();
      },50);
    }
    if (i === 1 && this.notification.windowOpen) {
      this.notification.toggleWindow();
    }
    if (
      (i === 1 && !this.notification.messagesShowing) ||
      (i !== 1 && this.notification.messagesShowing && !this.notification.windowOpen)
    ) {
        this.notification.toggleMessagesShowing(true);
      }
  }

  
}
