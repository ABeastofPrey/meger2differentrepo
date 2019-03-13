import { Jump3DialogComponent } from './../dialogs/jump3-dialog/jump3-dialog.component';
import { JumpDialogComponent } from './../dialogs/jump-dialog/jump-dialog.component';
import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DataService, WebsocketService} from '../../../core';
import {ProgramEditorService} from '../../services/program-editor.service';
import {GripperSelectorComponent} from '../dialogs/gripper-selector/gripper-selector.component';
import {Gripper} from '../../../core/models/gripper.model';
import {PalletPickerDialogComponent} from '../dialogs/pallet-picker-dialog/pallet-picker-dialog.component';
import {PalletIndexDialogComponent} from '../dialogs/pallet-index-dialog/pallet-index-dialog.component';
import {CallDialogComponent} from '../dialogs/call-dialog/call-dialog.component';
import {IfDialogComponent} from '../dialogs/if-dialog/if-dialog.component';
import {WhileDialogComponent} from '../dialogs/while-dialog/while-dialog.component';
import {SleepDialogComponent} from '../dialogs/sleep-dialog/sleep-dialog.component';
import {MoveDialogComponent} from '../dialogs/move-dialog/move-dialog.component';
import {CircleDialogComponent} from '../dialogs/circle-dialog/circle-dialog.component';
import {RobotSelectorDialogComponent} from '../dialogs/robot-selector-dialog/robot-selector-dialog.component';
import {DelayDialogComponent} from '../dialogs/delay-dialog/delay-dialog.component';
import {IoSelectorDialogComponent} from '../dialogs/io-selector-dialog/io-selector-dialog.component';
import {DimDialogComponent} from '../dialogs/dim-dialog/dim-dialog.component';
import {LineParser} from '../../../core/models/line-parser.model';
import {StopDialogComponent} from '../dialogs/stop-dialog/stop-dialog.component';
import {Payload} from '../../../core/models/payload.model';
import {PayloadSelectorComponent} from '../dialogs/payload-selector/payload-selector.component';
import { HomeDialogComponent } from '../dialogs/home-dialog/home-dialog.component';

@Component({
  selector: 'program-edit-menu',
  templateUrl: './program-edit-menu.component.html',
  styleUrls: ['./program-edit-menu.component.css']
})
export class ProgramEditMenuComponent implements OnInit {

  parser: LineParser;
  isScara: boolean = false;

  constructor(
    public prg : ProgramEditorService,
    public data : DataService,
    private dialog : MatDialog,
    private ws: WebsocketService
  ) { }

  ngOnInit() {
    this.parser = this.prg.parser;

    this.isScara = this.data.robotType === 'SCARA';
  }

  menu_grp_use() {
    let ref = this.dialog.open(GripperSelectorComponent,{
      data: 'Set Gripper'
    });
    ref.afterClosed().subscribe((grp:Gripper)=>{
      if (grp) {
        const cmd = 'GRP_SET_ACTIVE_GRIPPER("'+grp.ef+'","'+grp.name+'")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }

  menu_grp_open() {
    let ref = this.dialog.open(GripperSelectorComponent,{
      data: 'Open Gripper'
    });
    ref.afterClosed().subscribe((grp:Gripper)=>{
      if (grp) {
        const cmd = 'GRP_OPEN_GRIPPER("' + grp.ef + '","' + grp.name + '")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }

  menu_grp_close() {
    let ref = this.dialog.open(GripperSelectorComponent,{
      data: 'Close Gripper'
    });
    ref.afterClosed().subscribe((grp:Gripper)=>{
      if (grp) {
        const cmd = 'GRP_CLOSE_GRIPPER("' + grp.ef + '","' + grp.name + '")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  
  menu_pay_use() {
    this.dialog.open(PayloadSelectorComponent,{
      data: 'Set Payload'
    }).afterClosed().subscribe((pay:Payload)=>{
      if (pay) {
        const cmd = '?PAY_SET_PAYLOAD("' + pay.name + '")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }

  menu_plt_pick() {
    let ref = this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: 'projectCommands.other.title_pick',
        pickRobot: true
      }
    });
    ref.afterClosed().subscribe(plt=>{
      if (plt) {
        let cmd = 'PLT_PICK_FROM_PALLET('+plt.robot+',"'+plt.pallet+'")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_plt_place() {
    let ref = this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: 'projectCommands.other.title_place',
        pickRobot: true
      }
    });
    ref.afterClosed().subscribe(plt=>{
      if (plt) {
        let cmd = 'PLT_PLACE_ON_PALLET('+plt.robot+',"'+plt.pallet+'")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_plt_home() {
    let ref = this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: 'projectCommands.other.title_home',
        pickRobot: true
      }
    });
    ref.afterClosed().subscribe(plt=>{
      if (plt) {
        const cmd = 'PLT_MOVE_TO_ENTRY_POSITION(' + plt.robot + ',"' + 
                  plt.pallet + '")';
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_plt_index() {
    let ref = this.dialog.open(PalletIndexDialogComponent);
    ref.afterClosed().subscribe(cmd=>{
      if (cmd)
        this.prg.insertAndJump(cmd,0);
    });
  }
  menu_plt_get_index() {
    this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: 'projectCommands.other.title_plt_index',
        pickRobot: false
      }
    }).afterClosed().subscribe(plt=>{
      if (plt)
        this.prg.insertAndJump('?PLT_GET_INDEX_STATUS("'+plt.pallet+'")',0);
    });
  }
  menu_plt_status() {
    this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: 'Insert Get Pallet Status Command',
        pickRobot: false
      }
    }).afterClosed().subscribe(plt=>{
      if (plt)
        this.prg.insertAndJump('?PLT_GET_STATUS("' + plt.pallet + '")',0);
    });
  }
  menu_edit_line() {
    this.prg.getCurrentLineType();
    if (this.prg.lineParams === null)
      return;
    switch (this.prg.lineParams['lineType']) {
      case this.prg.parser.LineType.MOVE:
        this.menu_move(this.prg.lineParams['moves'], this.prg.lineParams);
        break;
      case this.prg.parser.LineType.CIRCLE:
        this.menu_circle(this.prg.lineParams['target'].length === 1, this.prg.lineParams);
        break;
    }
  }
  menu_program() { this.prg.insertAndJump('program\n\n\t\n\nend program',3); }
  menu_call() {
    let ref = this.dialog.open(CallDialogComponent);
    ref.afterClosed().subscribe(expression=>{
      if (expression)
        this.prg.insertAndJump('call ' + expression,0);
    });
  }
  menu_if_else() {
    let ref = this.dialog.open(IfDialogComponent);
    ref.afterClosed().subscribe(ret=>{
      if (ret.expression) {
        let cmd = "if " + ret.expression + " then\n\t'Do Something...";
        if (ret.else)
          cmd += "\nelse\n\t'Do something else...";
        cmd += "\nend if";
        this.prg.insertAndJump(cmd, 2);
      }
    });
  }
  menu_while() {
    let ref = this.dialog.open(WhileDialogComponent);
    ref.afterClosed().subscribe(expression=>{
      if (expression) {
        const txt = this.prg.rangeText ?
          this.prg.rangeText.split('\n').join('\n\t') :
          '\'Do something...';
        let cmd = "while "+expression+"\n\t"+txt+"\n\t'sleep 1\nend while";
        if (this.prg.rangeText)
          this.prg.replaceRange(cmd);
        else
          this.prg.insertAndJump(cmd,2);
      }
    });
  }
  menu_for() {
    this.prg.insertAndJump("for i = 1 to 1\n\t'Do something...\nnext", 2);
  }
  menu_case() {
    let cmd = "select case var\n\tcase 1\n\t\t'Do something...\n\tcase 2\n\t\t'Do something...\nend select";
    this.prg.insertAndJump(cmd, 3);
  }
  menu_sleep() {
    let ref = this.dialog.open(SleepDialogComponent);
    ref.afterClosed().subscribe(time=>{
      if (time) {
        this.prg.insertAndJump('sleep ' + time, 0);
      }
    });
  }
  menu_move(moves: boolean, params? : any) {
    let ref = this.dialog.open(
      MoveDialogComponent,
      {
        width: '400px',
        data: {moveS: moves, params: params}
      }
    );
    ref.afterClosed().subscribe((cmd:string)=>{
      if (cmd) {
        if (params) {
          let index = params['line']; // Line index
          this.prg.replaceLine(index,cmd);
        } else {
          this.prg.insertAndJump(cmd,0);
        }
      }
    });
  }
  menu_circle(angle: boolean, params? : any) {
    let ref = this.dialog.open(
      CircleDialogComponent,
      {
        width: '400px',
        data: {angle: angle, params: params}
      }
    );
    ref.afterClosed().subscribe((cmd:string)=>{
      if (cmd) {
        if (params) {
          let index = params['line']; // Line index
          this.prg.replaceLine(index,cmd);
        } else {
          this.prg.insertAndJump(cmd,0);
        }
      }
    });
  }
  menu_attach() {
    let cmd = 'Attach';
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title:'projectCommands.other.title_attach',
          must: false
        }
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (!robot)
        return;
      if (robot !== 'NULL')
        cmd += ' ' + robot + '\n\nDetach ' + robot;
      else
        cmd += '\n\nDetach';
      this.prg.insertAndJump(cmd,2);
    });
  }
  menu_dopass() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title:'projectCommands.other.title_doPass',
          must: false
        }
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (robot) {
        let cmd = 'DoPass';
        if (robot !== 'NULL')
          cmd += ' ' + robot;
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_jump() {
    let ref = this.dialog.open(
      JumpDialogComponent,
      {
        width: '400px',
        disableClose: true
      }
    );
    ref.afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_jump3(commandType: string) {
    const type = commandType === 'jump3' ? 'Jump3' : 'Jump3cp';
    this.dialog.open(
      Jump3DialogComponent,
      {
        width: '400px',
        disableClose: true,
        data: { type: type }
      }
    ).afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(commandType + cmd, 0);
      }
    });
  }
  menu_gohome() {
    this.dialog.open(
      HomeDialogComponent,
      {
        width: '400px',
        disableClose: true,
        data: 'nothing'
      }
    ).afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_stop() {
    let ref = this.dialog.open(StopDialogComponent,{width: '400px'});
    ref.afterClosed().subscribe(cmd=>{
      if (cmd)
        this.prg.insertAndJump(cmd,0);
    });
  }
  menu_waitForMotion() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {title:'projectCommands.other.title_waitForMotion', must: false}
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (robot) {
        let cmd = 'WaitForMotion';
        if (robot !== 'NULL')
          cmd += ' ' + robot;
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_delay() {
    let ref = this.dialog.open(
      DelayDialogComponent,
      {
        width: '400px'
      }
    );
    ref.afterClosed().subscribe((cmd:string)=>{
      if (cmd) {
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_enable() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {title:'projectCommands.other.title_en', must: false}
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (robot) {
        let cmd = 'En = 1';
        if (robot !== 'NULL')
          cmd = robot + '.' + cmd;
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_disable() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {title:'projectCommands.other.title_disable', must: false}
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (robot) {
        let cmd = 'En = 0';
        if (robot !== 'NULL')
          cmd = robot + '.' + cmd;
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_inputs() {
    let ref = this.dialog.open(
      IoSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title: 'projectCommands.other.title_inRef',
          inputs: true,
          outputs: false
        }
      }
    );
    ref.afterClosed().subscribe((io:string)=>{
      if (io) {
        this.prg.insertAndJump('Sys.din[din::' + io + ']',0);
      }
    });
  }
  menu_outputs() {
    let ref = this.dialog.open(
      IoSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title: 'projectCommands.other.title_outRef',
          inputs: false,
          outputs: true
        }
      }
    );
    ref.afterClosed().subscribe((io:string)=>{
      if (io) {
        this.prg.insertAndJump('Sys.dout[dout::' + io + ']',0);
      }
    });
  }
  menu_dim() {
    let ref = this.dialog.open(
      DimDialogComponent,
      {
        width: '400px'
      }
    );
    ref.afterClosed().subscribe((cmd:string)=>{
      if (cmd) {
        this.prg.insertAndJump(cmd,0);
      }
    });
  }

}
