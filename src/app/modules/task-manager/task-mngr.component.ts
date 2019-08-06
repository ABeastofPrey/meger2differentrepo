import { Component, OnInit, ApplicationRef } from '@angular/core';
import { TaskService } from '../../modules/core/services/task.service';
import { UtilsService } from '../core/services/utils.service';
import { MCTask, ScreenManagerService, LoginService } from '../core';
import { Router } from '@angular/router';
import { ProgramEditorService } from '../program-editor/services/program-editor.service';

@Component({
  selector: 'task-mngr',
  templateUrl: './task-mngr.component.html',
  styleUrls: ['./task-mngr.component.css'],
})
export class TaskMngrComponent implements OnInit {
  private mouseDown: boolean = false;
  private selected: number[] = [];

  filterPrograms: boolean = false;
  filterLibs: boolean = false;
  filterGlobalLibs: boolean = false;
  filterUser: boolean = true;
  filterBackground: boolean = false;

  constructor(
    public task: TaskService,
    private ref: ApplicationRef,
    private utils: UtilsService,
    private mgr: ScreenManagerService,
    private router: Router,
    private prg: ProgramEditorService,
    private login: LoginService
  ) {
    this.task.start();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.task.stop();
  }

  openFile(task: MCTask) {
    if (this.login.getCurrentUser().user.permission > 0) return;
    let path = task.filePath;
    if (path) path = path.substring(0, path.lastIndexOf('/')) + '/';
    this.mgr.screen = this.mgr.screens[2];
    this.router.navigateByUrl('/projects');
    this.prg.setFile(task.name, path, null, -1);
    this.prg.mode = 'editor';
  }

  onSelectionStart(index) {
    let position = this.selected.indexOf(index);
    if (position >= 0 && this.selected.length === 1)
      this.selected.splice(position, 1);
    else this.selected = [index];
    this.mouseDown = true;
    this.ref.tick();
  }

  onSelection(index) {
    if (!this.mouseDown) return;
    let position = this.selected.indexOf(index);
    if (position >= 0) this.selected.splice(position, 1);
    else this.selected.push(index);
    this.ref.tick();
  }

  onSelectionEnd() {
    this.mouseDown = false;
    this.ref.tick();
  }

  isSelected(index): boolean {
    return this.selected.includes(index);
  }
  private get filtersAsArr() {
    return [this.filterPrograms, this.filterLibs, this.filterGlobalLibs, this.filterUser, this.filterBackground];
  }
  run() {
    this.task.run(this.selected, this.filtersAsArr);
  }
  kill() {
    this.task.kill(this.selected, this.filtersAsArr);
  }
  idle() {
    this.task.idle(this.selected, this.filtersAsArr);
  }
  unload() {
    this.task.unload(this.selected, this.filtersAsArr);
    this.selected = [];
  }
  resetAll() {
    this.utils.resetAll(true);
  }
}
