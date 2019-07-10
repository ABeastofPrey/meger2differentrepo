import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService, TpStatService } from '../../modules/core';

@Component({
  selector: 'jog-settings-dialog',
  templateUrl: './jog-settings-dialog.component.html',
  styleUrls: ['./jog-settings-dialog.component.css'],
})
export class JogSettingsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService,
    public stat: TpStatService
  ) {}

  close() {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
