import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private mouseDown = false;
  private selected: number[] = [];

  filterPrograms = false;
  filterLibs = false;
  filterGlobalLibs = false;
  filterUser = true;
  filterBackground = false;

  constructor(
    public task: TaskService,
    private ref: ChangeDetectorRef,
    private utils: UtilsService,
    private mgr: ScreenManagerService,
    private router: Router,
    private prg: ProgramEditorService,
    public login: LoginService
  ) {
    this.task.start();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.task.stop();
  }

  async openFile(task: MCTask) {
    if (!this.login.isAdmin && !this.login.isSuper) return;
    let path = task.filePath;
    if (path) path = path.substring(0, path.lastIndexOf('/')) + '/';
    this.prg.mode = 'editor';
    await this.router.navigateByUrl('/projects');
    this.mgr.screen = this.mgr.screens[2];
    await this.prg.setModeToggle('mc');
    this.prg.setFile(task.name, path, null, -1);
  }

  onSelectionStart(index) {
    const position = this.selected.indexOf(index);
    if (position >= 0 && this.selected.length === 1) {
      this.selected.splice(position, 1);
    }
    else this.selected = [index];
    this.mouseDown = true;
    this.ref.detectChanges();
  }

  onSelection(index) {
    if (!this.mouseDown) return;
    const position = this.selected.indexOf(index);
    if (position >= 0) this.selected.splice(position, 1);
    else this.selected.push(index);
    this.ref.detectChanges();
  }

  onSelectionEnd() {
    this.mouseDown = false;
    this.ref.detectChanges();
  }

  isSelected(index): boolean {
    return this.selected.includes(index);
  }
  private get filtersAsArr() {
    return [this.filterPrograms, this.filterLibs, this.filterGlobalLibs, this.filterUser, this.filterBackground];
  }
  run() {
    this.task.run(this.selected, this.filtersAsArr, true);
  }
  kill() {
    this.task.kill(this.selected, this.filtersAsArr, true);
  }
  idle() {
    this.task.idle(this.selected, this.filtersAsArr, true);
  }
  unload() {
    this.task.unload(this.selected, this.filtersAsArr, true);
    this.selected = [];
  }
  resetAll() {
    this.utils.resetAll(true);
  }
}
