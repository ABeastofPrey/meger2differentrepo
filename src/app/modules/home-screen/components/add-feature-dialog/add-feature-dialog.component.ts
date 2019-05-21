import { Component, OnInit } from '@angular/core';
import {Feature} from '../../models/feature.model';
import {MatDialogRef} from '@angular/material';
import {GroupManagerService} from '../../../core';

@Component({
  selector: 'app-add-feature-dialog',
  templateUrl: './add-feature-dialog.component.html',
  styleUrls: ['./add-feature-dialog.component.css']
})
export class AddFeatureDialogComponent implements OnInit {
  
  feature: Feature = new Feature();

  constructor(private dialog: MatDialogRef<any>, private grp: GroupManagerService) { }

  ngOnInit() {
    this.feature.hash = this.grp.sysInfo.hash;
  }
  
  isFeatureInvalid() : boolean {
    return this.feature.name.length === 0 ||
    this.feature.code.length === 0;
  }
  
  add() {
    this.dialog.close(this.feature);
  }

}
