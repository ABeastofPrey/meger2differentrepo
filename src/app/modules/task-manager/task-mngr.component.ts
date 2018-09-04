import { Component, OnInit, ApplicationRef } from '@angular/core';
import {TaskService} from '../../modules/core/services/task.service';
import {TpStatService} from '../core';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'task-mngr',
  templateUrl: './task-mngr.component.html',
  styleUrls: ['./task-mngr.component.css']
})
export class TaskMngrComponent implements OnInit {
  
  private mouseDown : boolean = false;
  private selected : number[] = [];
  
  filterPrograms: boolean = true;
  filterLibs: boolean = true;
  filterGlobalLibs: boolean = true;

  constructor(
    public task : TaskService,
    private ref:ApplicationRef,
    private stat: TpStatService,
    private snack: MatSnackBar
  ) {
    this.task.start();
  }

  ngOnInit() {
  }
  
  ngOnDestroy() {
    this.task.stop();
  }
  
  onSelectionStart(index) {
    let position = this.selected.indexOf(index);
    if (position >= 0 && this.selected.length === 1)
      this.selected.splice(position,1);
    else
      this.selected = [index];
    this.mouseDown = true;
    this.ref.tick();
  }
    
  onSelection(index) {
    if (!this.mouseDown)
      return;
    let position = this.selected.indexOf(index);
    if (position >= 0)
      this.selected.splice(position,1);
    else
      this.selected.push(index);
    this.ref.tick();
  }
  
  onSelectionEnd() {
    this.mouseDown = false;
    this.ref.tick();
  }
  
  isSelected(index) : boolean {
    return this.selected.includes(index);
  }
  
  run() { this.task.run(this.selected); }
  kill() { this.task.kill(this.selected); }
  idle() { this.task.idle(this.selected); }
  unload() { 
    this.task.unload(this.selected);
    this.selected = [];
  }
  resetAll() {
    this.stat.resetAll().then(()=>{
      return this.task.resetAll();
    }).then(()=>{
      this.stat.startTpLibChecker();
      this.snack.open('System Reset Success',null,{duration:1500});
    });
  }

}
