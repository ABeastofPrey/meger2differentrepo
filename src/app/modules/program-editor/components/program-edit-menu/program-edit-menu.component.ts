import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {DataService} from '../../../core';
import {ProgramEditorService} from '../../services/program-editor.service';
import {LineParserService} from '../../services/line-parser.service';

@Component({
  selector: 'program-edit-menu',
  templateUrl: './program-edit-menu.component.html',
  styleUrls: ['./program-edit-menu.component.css']
})
export class ProgramEditMenuComponent implements OnInit {

  constructor(
    public prg : ProgramEditorService,
    public parser: LineParserService,
    public data : DataService,
    private dialog : MatDialog
  ) { }

  ngOnInit() {
  }
  
  /*menu_grp_use() {
    let ref = this.dialog.open(GripperSelectorComponent,{
      data: 'Set Active Gripper'
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
  
  menu_plt_pick() {
    let ref = this.dialog.open(PalletPickerDialogComponent,{
      data: {
        title: this.lang.get('insert_cmd_plt_pick'),
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
        title: this.lang.get('insert_cmd_plt_place'),
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
        title: this.lang.get('insert_cmd_plt_home'),
        pickRobot: true
      }
    });
    ref.afterClosed().subscribe(plt=>{
      if (plt) {
        let cmd = 'PLT_MOVE_TO_HOME_POSITION('+plt.robot+',"'+plt.pallet+'")';
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
  menu_sub() {
    let ref = this.dialog.open(SubDialogComponent);
    ref.afterClosed().subscribe(name=>{
      if (name) {
        let cmd = '\n\npublic sub ' + name + '\n\n\t\n\nend sub';
        this.prg.insertFunction(cmd);
      }
    });
  }
  menu_function() {
    let ref = this.dialog.open(FunctionDialogComponent);
    ref.afterClosed().subscribe(ret=>{
      if (ret) {
        let cmd = '\n\npublic function ' +
                  ret.name + ' as ' + ret.type + '\n\n\t\n\nend function';
        this.prg.insertFunction(cmd);
      }
    });
  }
  menu_program() { this.prg.insertAndJump('program\n\n\t\n\nend program',3); }
  menu_program_settings() {
    let ref = this.dialog.open(ProgramSettingsDialogComponent);
    ref.afterClosed().subscribe(result=>{
      if (result)
        this.prg.insertAndJump(result,0);
    });
  }
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
  menu_dopass() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title:this.lang.get('insert_cmd_dopass'),
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
  menu_stop() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {title:this.lang.get('insert_cmd_stop'), must: false}
      }
    );
    ref.afterClosed().subscribe((robot:string)=>{
      if (robot) {
        let cmd = 'Stop';
        if (robot !== 'NULL')
          cmd += ' ' + robot;
        this.prg.insertAndJump(cmd,0);
      }
    });
  }
  menu_waitForMotion() {
    let ref = this.dialog.open(
      RobotSelectorDialogComponent,
      {
        width: '400px',
        data: {title:this.lang.get('insert_cmd_waitForMotion'), must: false}
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
        width: '400px',
        data: {title:this.lang.get('insert_cmd_delay')}
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
        data: {title:this.lang.get('insert_cmd_enable'), must: false}
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
        data: {title:this.lang.get('insert_cmd_disable'), must: false}
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
          title: this.lang.get('insert_cmd_input'),
          inputs: true,
          outputs: false
        }
      }
    );
    ref.afterClosed().subscribe((io:string)=>{
      if (io) {
        this.prg.insertAndJump('Sys.din.' + io,0);
      }
    });
  }
  menu_outputs() {
    let ref = this.dialog.open(
      IoSelectorDialogComponent,
      {
        width: '400px',
        data: {
          title: this.lang.get('insert_cmd_output'),
          inputs: false,
          outputs: true
        }
      }
    );
    ref.afterClosed().subscribe((io:string)=>{
      if (io) {
        this.prg.insertAndJump('Sys.dout.' + io,0);
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
  }*/

}