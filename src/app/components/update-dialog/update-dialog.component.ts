import { Component, OnInit } from '@angular/core';
import {Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog-component.html',
  styleUrls: ['./update-dialog.component.css']
})
export class UpdateDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public title: string) { }

  ngOnInit() {
  }

}
