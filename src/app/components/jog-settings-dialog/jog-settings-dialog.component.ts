import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService, TpStatService } from '../../modules/core';

@Component({
  selector: 'jog-settings-dialog',
  templateUrl: './jog-settings-dialog.component.html',
  styleUrls: ['./jog-settings-dialog.component.css'],
})
export class JogSettingsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<JogSettingsDialogComponent, void>,
    public dataService: DataService,
    public stat: TpStatService
  ) {}

  close() {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
