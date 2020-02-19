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
  styleUrls: ['./notification-window.component.css']
})
export class NotificationWindowComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    
  }
}
