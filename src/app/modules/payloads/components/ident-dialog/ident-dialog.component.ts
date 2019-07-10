import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { WebsocketService } from '../../../core';

@Component({
  selector: 'app-ident-dialog',
  templateUrl: './ident-dialog.component.html',
  styleUrls: ['./ident-dialog.component.css'],
})
export class IdentDialogComponent implements OnInit {
  timeLeft: number = 0;
  started: boolean = false;
  finished: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<boolean>,
    private ws: WebsocketService
  ) {}

  ngOnInit() {
    this.timeLeft = this.data.duration;
    this.ws.isConnected.subscribe(ret => {
      if (!ret) this.dialogRef.close(false);
    });
  }

  start() {
    if (this.started) return;
    this.started = true;
    const interval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) clearInterval(interval);
    }, 1000);
  }

  finish() {
    this.finished = true;
  }

  stop() {
    this.ws.query('?PAY_ESTOP');
    this.dialogRef.close(false);
  }
}
