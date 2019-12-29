import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-osupgrade-success-dialog',
  templateUrl: './osupgrade-success-dialog.component.html',
  styleUrls: ['./osupgrade-success-dialog.component.css'],
})
/**
 * This class describes the success dialog for the OS upgrade.
 */
export class OSUpgradeSuccessDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    title: string,
    msg: string,
    guiVersion: string,
    webServerVersion: string,
    softMCVersion: string,
    libraryVersion: string
  }) {}

  ngOnInit() {}
}
