import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-osupgrade-error-dialog',
  templateUrl: './osupgrade-error-dialog.component.html',
  styleUrls: ['./osupgrade-error-dialog.component.css'],
})
/**
 * This class describes the error dialog for the OS upgrade.
 */
export class OSUpgradeErrorDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    title: string,
    message: string,
    guiVersion: string,
    webServerVersion: string,
    softMCVersion: string,
    libraryVersion: string
  }) {}

  ngOnInit() {}
}
