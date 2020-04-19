import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-file-dialog',
  templateUrl: './new-file-dialog.component.html',
  styleUrls: ['./new-file-dialog.component.css'],
})
export class NewFileDialogComponent implements OnInit {

  ext = 'PRG';
  name = new FormControl('',[Validators.required, Validators.maxLength(32), Validators.pattern('[a-zA-Z]+(\\w*)$')]);

  constructor(private ref: MatDialogRef<string>) {}

  ngOnInit() {}

  create() {
    const finalName = this.name.value + '.' + this.ext;
    this.ref.close(finalName.toUpperCase());
  }
}