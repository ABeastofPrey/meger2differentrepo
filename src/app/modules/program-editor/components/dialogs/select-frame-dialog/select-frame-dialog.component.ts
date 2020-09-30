import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { DataService } from '../../../../core';
import { AddFrameComponent } from '../../add-frame/add-frame.component';
import { TPVariableType } from '../../../../core/models/tp/tp-variable-type.model';
import { FrameTypes } from '../../../../../modules/core/models/frames';

enum FrameName {
  TOOL = 'tool',
  BASE = 'base'
}

@Component({
  selector: 'app-select-frame-dialog',
  templateUrl: './select-frame-dialog.component.html',
  styleUrls: ['./select-frame-dialog.component.scss']
})
export class SelectFrameDialogComponent implements OnInit {

  public title = '';

  public label = '';

  public addBtnName = 'button.add';

  public frames: TPVariable[] = [];

  public selectedFrame: string;

  public frameType: FrameTypes;

  constructor(public dialogRef: MatDialogRef<SelectFrameDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) private data: { type: FrameTypes },
    private dialog: MatDialog,
    private dataService: DataService) {

  }

  async ngOnInit() {
    this.frameType = this.data.type;
    await this.getData();
  }

  public onInsert(): void {
    const cmd = this.frameType === FrameTypes.TOOL ? `SelectTool("${this.selectedFrame}")` : `SelectBase("${this.selectedFrame}")`;
    this.dialogRef.close(cmd);
  }

  public createFrame(): void {
    this.dialog
      .open(AddFrameComponent, {
        data: this.frameType,//
      })
      .afterClosed()
      .subscribe((ret: { name: string }) => {
        if (!ret) return;
        this.getData();
        this.selectedFrame = ret.name.toUpperCase();
      });
  }

  private async getData() {
    let newData = [];
    let frameName = '';
    if (this.frameType === FrameTypes.TOOL) {
      frameName = FrameName.TOOL;
      await this.dataService.refreshTools();
      newData = this.dataService.tools;
    } else if (this.frameType === FrameTypes.BASE) {
      frameName = FrameName.BASE;
      await this.dataService.refreshBases();
      newData = this.dataService.bases;
    }
    this.title = `projectCommands.selectFrame.${frameName}.title`;
    this.label = `projectCommands.selectFrame.${frameName}.label`;
    this.addBtnName = `projectCommands.selectFrame.${frameName}.add`;

    this.frames = newData.map((item) => new TPVariable(TPVariableType.LOCATION, item));
  }



}
