import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Jump3DialogService } from '../../../services/jump3-dialog.service';

@Component({
  selector: 'app-pls-source',
  templateUrl: './pls-source.component.html',
  styleUrls: ['./pls-source.component.scss'],
})
export class PLSSourceComponent implements OnInit {
  motionElements: string[];
  motionElement: string;
  source = 'PathLength';
  constructor(
    public dialogRef: MatDialogRef<PLSSourceComponent>,
    private jumpService: Jump3DialogService
  ) {}

  async ngOnInit(): Promise<void> {
    this.motionElements = await this.jumpService.retriveMotionElements();
    this.motionElement = this.motionElements[0];
  }

  emitCmd(): void {
    this.dialogRef.close(`${this.motionElement}.plssource=${this.source}`);
  }
}
