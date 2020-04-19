import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataService, WebsocketService } from '../../../core';
import { ProgramEditorService } from '../../services/program-editor.service';
import { GripperSelectorComponent } from '../dialogs/gripper-selector/gripper-selector.component';
import { Gripper } from '../../../core/models/gripper.model';
import { PalletPickerDialogComponent } from '../dialogs/pallet-picker-dialog/pallet-picker-dialog.component';
import { PalletIndexDialogComponent } from '../dialogs/pallet-index-dialog/pallet-index-dialog.component';
import { CallDialogComponent } from '../dialogs/call-dialog/call-dialog.component';
import { IfDialogComponent } from '../dialogs/if-dialog/if-dialog.component';
import { WhileDialogComponent } from '../dialogs/while-dialog/while-dialog.component';
import { SleepDialogComponent } from '../dialogs/sleep-dialog/sleep-dialog.component';
import { MoveDialogComponent } from '../dialogs/move-dialog/move-dialog.component';
import { CircleDialogComponent } from '../dialogs/circle-dialog/circle-dialog.component';
import { RobotSelectorDialogComponent } from '../dialogs/robot-selector-dialog/robot-selector-dialog.component';
import { DelayDialogComponent } from '../dialogs/delay-dialog/delay-dialog.component';
import { DimDialogComponent } from '../dialogs/dim-dialog/dim-dialog.component';
import { LineParser } from '../../../core/models/line-parser.model';
import { StopDialogComponent } from '../dialogs/stop-dialog/stop-dialog.component';
import { Payload } from '../../../core/models/payload.model';
import { PayloadSelectorComponent } from '../dialogs/payload-selector/payload-selector.component';
import { HomeDialogComponent } from '../dialogs/home-dialog/home-dialog.component';
import { IoSelectorDialogComponent } from '../../../../components/io-selector-dialog/io-selector-dialog.component';
import { PLSSourceComponent } from '../dialogs/pls-source/pls-source.component';
import { CommandType as VisionCommandType } from '../combined-dialogs/enums/vision-command.enum';
import { CommandType as JumpxCommandType } from '../combined-dialogs/enums/jumpx-command.enums';
import { VisionCommandComponent } from '../combined-dialogs/components/vision-command/vision-command.component';
import { VisionLoadStationBookComponent } from '../dialogs/vision-load-station-book/vision-load-station-book.component';
import { JumpxCommandComponent } from '../combined-dialogs/components/jumpx-command/jumpx-command.component';
import { ProceedDialogComponent } from '../dialogs/proceed-dialog/proceed-dialog.component';

@Component({
  selector: 'program-edit-menu',
  templateUrl: './program-edit-menu.component.html',
  styleUrls: ['./program-edit-menu.component.css'],
})
export class ProgramEditMenuComponent implements OnInit {
  parser: LineParser;
  isScara = false;
  visionCommandType = VisionCommandType;
  jumpxCommandType = JumpxCommandType;

  constructor(
    public prg: ProgramEditorService,
    public data: DataService,
    private dialog: MatDialog,
    private ws: WebsocketService
  ) {}

  ngOnInit() {
    this.parser = this.prg.parser;
    this.data.dataLoaded.subscribe(stat=>{
      if (!stat) return;
      this.isScara = this.data.robotType === 'SCARA';
    });
  }

  menu_grp_use() {
    const ref = this.dialog.open(GripperSelectorComponent, {
      data: 'grippers.set',
    });
    ref.afterClosed().subscribe((grp: Gripper) => {
      if (grp) {
        const cmd =
          'GRP_SET_ACTIVE_GRIPPER("' + grp.ef + '","' + grp.name + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }

  menu_grp_open() {
    const ref = this.dialog.open(GripperSelectorComponent, {
      data: 'grippers.open',
    });
    ref.afterClosed().subscribe((grp: Gripper) => {
      if (grp) {
        const cmd = 'GRP_OPEN_GRIPPER("' + grp.ef + '","' + grp.name + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }

  menu_grp_close() {
    const ref = this.dialog.open(GripperSelectorComponent, {
      data: 'grippers.close',
    });
    ref.afterClosed().subscribe((grp: Gripper) => {
      if (grp) {
        const cmd = 'GRP_CLOSE_GRIPPER("' + grp.ef + '","' + grp.name + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }

  menu_pay_use() {
    this.dialog
      .open(PayloadSelectorComponent, {
        data: 'Set Payload',
      })
      .afterClosed()
      .subscribe((pay: Payload) => {
        if (pay) {
          const cmd = 'PAY_SET_PAYLOAD("' + pay.name + '")';
          this.prg.insertAndJump(cmd, 0);
        }
      });
  }

  menu_plt_pick() {
    const ref = this.dialog.open(PalletPickerDialogComponent, {
      data: {
        title: 'projectCommands.other.title_pick',
        pickRobot: true,
      },
    });
    ref.afterClosed().subscribe(plt => {
      if (plt) {
        const cmd =
          'PLT_PICK_FROM_PALLET(' + plt.robot + ',"' + plt.pallet + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_plt_place() {
    const ref = this.dialog.open(PalletPickerDialogComponent, {
      data: {
        title: 'projectCommands.other.title_place',
        pickRobot: true,
      },
    });
    ref.afterClosed().subscribe(plt => {
      if (plt) {
        const cmd = 'PLT_PLACE_ON_PALLET(' + plt.robot + ',"' + plt.pallet + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_plt_home() {
    const ref = this.dialog.open(PalletPickerDialogComponent, {
      data: {
        title: 'projectCommands.other.title_plt_entry',
        pickRobot: true,
      },
    });
    ref.afterClosed().subscribe(plt => {
      if (plt) {
        const cmd =
          'PLT_MOVE_TO_ENTRY_POSITION(' + plt.robot + ',"' + plt.pallet + '")';
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_plt_index() {
    const ref = this.dialog.open(PalletIndexDialogComponent);
    ref.afterClosed().subscribe(cmd => {
      if (cmd) this.prg.insertAndJump(cmd, 0);
    });
  }
  menu_plt_get_index() {
    this.dialog
      .open(PalletPickerDialogComponent, {
        data: {
          title: 'projectCommands.other.title_plt_index',
          pickRobot: false,
        },
      })
      .afterClosed()
      .subscribe(plt => {
        if (plt) {
          this.prg.insertAndJump(
            '?PLT_GET_INDEX_STATUS("' + plt.pallet + '")',
            0
          );
        }
      });
  }
  menu_plt_status() {
    this.dialog
      .open(PalletPickerDialogComponent, {
        data: {
          title: 'projectCommands.other.title_plt_status',
          pickRobot: false,
        },
      })
      .afterClosed()
      .subscribe(plt => {
        if (plt) {
          this.prg.insertAndJump('?PLT_GET_STATUS("' + plt.pallet + '")', 0);
        }
      });
  }
  menu_edit_line() {
    this.prg.getCurrentLineType();
    if (this.prg.lineParams === null) return;
    switch (this.prg.lineParams['lineType']) {
      case this.prg.parser.LineType.MOVE:
        this.menu_move(this.prg.lineParams['moves'], this.prg.lineParams);
        break;
      case this.prg.parser.LineType.CIRCLE:
        const angle = this.prg.lineParams['angle'];
        this.menu_circle(
          !!angle,
          this.prg.lineParams
        );
        break;
      case this.prg.parser.LineType.JUMP:
        const params = this.prg.lineParams;
        this.jumpxCommand(params['commandName'], params['payload']);
      default:
        break;
    }
  }
  menu_program() {
    this.prg.insertAndJump('program\n\n\t\n\nend program', 3);
  }
  menu_call() {
    const ref = this.dialog.open(CallDialogComponent);
    ref.afterClosed().subscribe(expression => {
      if (expression) this.prg.insertAndJump('call ' + expression, 0);
    });
  }
  menu_if_else() {
    const ref = this.dialog.open(IfDialogComponent);
    ref.afterClosed().subscribe(ret => {
      if (ret.expression) {
        let cmd = 'if ' + ret.expression + " then\n\t'Do Something...";
        if (ret.else) cmd += "\nelse\n\t'Do something else...";
        cmd += '\nend if';
        this.prg.insertAndJump(cmd, 2);
      }
    });
  }
  menu_while() {
    const ref = this.dialog.open(WhileDialogComponent);
    ref.afterClosed().subscribe(expression => {
      if (expression) {
        const txt = this.prg.rangeText
          ? this.prg.rangeText.split('\n').join('\n\t')
          : "'Do something...";
        const cmd =
          'while ' + expression + '\n\t' + txt + "\n\t'sleep 1\nend while";
        if (this.prg.rangeText) this.prg.replaceRange(cmd);
        else this.prg.insertAndJump(cmd, 2);
      }
    });
  }
  menu_for() {
    this.prg.insertAndJump("for i = 1 to 1\n\t'Do something...\nnext", 2);
  }
  menu_case() {
    const cmd =
      "select case var\n\tcase 1\n\t\t'Do something...\n\tcase 2\n\t\t'Do something...\nend select";
    this.prg.insertAndJump(cmd, 3);
  }
  menu_sleep() {
    const ref = this.dialog.open(SleepDialogComponent);
    ref.afterClosed().subscribe(time => {
      if (time) {
        this.prg.insertAndJump('sleep ' + time, 0);
      }
    });
  }
  menu_move(moves: boolean, params?: {}) {
    const ref = this.dialog.open(MoveDialogComponent, {
      width: '400px',
      data: { moveS: moves, params },
      disableClose: true,
    });
    ref.afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        if (params) {
          const index = params['line']; // Line index
          this.prg.replaceLine(index, cmd);
        } else {
          this.prg.insertAndJump(cmd, 0);
        }
      }
    });
  }
  menu_circle(angle: boolean, params?: {}) {
    const ref = this.dialog.open(CircleDialogComponent, {
      width: '400px',
      data: { angle, params },
      disableClose: true,
    });
    ref.afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        if (params) {
          const index = params['line']; // Line index
          this.prg.replaceLine(index, cmd);
        } else {
          this.prg.insertAndJump(cmd, 0);
        }
      }
    });
  }
  menu_attach() {
    let cmd = 'Attach';
    const ref = this.dialog.open(RobotSelectorDialogComponent, {
      width: '400px',
      data: {
        title: 'projectCommands.other.title_attach',
        must: false,
      },
    });
    ref.afterClosed().subscribe((robot: string) => {
      if (!robot) return;
      if (robot !== 'NULL') cmd += ' ' + robot + '\n\nDetach ' + robot;
      else cmd += '\n\nDetach';
      this.prg.insertAndJump(cmd, 2);
    });
  }
  menu_gohome() {
    this.dialog
      .open(HomeDialogComponent, {
        width: '400px',
        disableClose: true,
        data: 'nothing',
      })
      .afterClosed()
      .subscribe((cmd: string) => {
        if (cmd) {
          this.prg.insertAndJump(cmd, 0);
        }
      });
  }
  menu_proceed() {
    const ref = this.dialog.open(ProceedDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(cmd => {
      if (cmd) this.prg.insertAndJump(cmd, 0);
    });
  }
  menu_stop() {
    const ref = this.dialog.open(StopDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(cmd => {
      if (cmd) this.prg.insertAndJump(cmd, 0);
    });
  }
  menu_waitForMotion() {
    const ref = this.dialog.open(RobotSelectorDialogComponent, {
      width: '400px',
      data: { title: 'projectCommands.other.title_waitForMotion', must: false },
    });
    ref.afterClosed().subscribe((robot: string) => {
      if (robot) {
        let cmd = 'WaitForMotion';
        if (robot !== 'NULL') cmd += ' ' + robot;
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_delay() {
    const ref = this.dialog.open(DelayDialogComponent, {
      width: '400px',
    });
    ref.afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  menu_enable() {
    this.prg.insertAndJump('power_on()', 0);
  }
  menu_disable() {
    this.prg.insertAndJump('power_off()', 0);
  }

  menu_pls_source() {
    this.dialog
      .open(PLSSourceComponent, {
        width: '400px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((cmd: string) => {
        if (cmd) {
          this.prg.insertAndJump(cmd, 0);
        }
      });
  }
  menu_inputs() {
    const ref = this.dialog.open(IoSelectorDialogComponent, {
      width: '400px',
      data: {
        title: 'projectCommands.other.title_inRef',
        inputs: true,
        outputs: false,
      },
    });
    ref.afterClosed().subscribe((io: string) => {
      if (io) {
        this.prg.insertAndJump('Sys.din[din::' + io + ']', 0);
      }
    });
  }
  menu_outputs() {
    const ref = this.dialog.open(IoSelectorDialogComponent, {
      width: '400px',
      data: {
        title: 'projectCommands.other.title_outRef',
        inputs: false,
        outputs: true,
      },
    });
    ref.afterClosed().subscribe((io: string) => {
      if (io) {
        this.prg.insertAndJump('Sys.dout[dout::' + io + ']', 0);
      }
    });
  }
  menu_dim() {
    this.dialog.open(DimDialogComponent).afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }
  
  vCommand(type: VisionCommandType): void {
    this.dialog.open(VisionCommandComponent, {
      width: '400px',
      disableClose: true,
      data: {
        type
      }
    }).afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });
  }

  jumpxCommand(type: JumpxCommandType, model = null): void {
    this.dialog.open(JumpxCommandComponent, {
      width: '400px',
      disableClose: true,
      data: {
        type,
        model
      }
    }).afterClosed().subscribe((cmd: string) => {
      if (cmd && !model) {
        this.prg.insertAndJump(cmd, 0);
      } else if (cmd && !!model) {
        let index = this.prg.lineParams['line']; // Line index
        this.prg.replaceLine(index, cmd);
      }
    });
  }

  vLoadStationBook(): void {
    this.dialog.open(VisionLoadStationBookComponent, {
      width: '400px',
      disableClose: true,
    }).afterClosed().subscribe((cmd: string) => {
      if (cmd) {
        this.prg.insertAndJump(cmd, 0);
      }
    });    
  }
}
