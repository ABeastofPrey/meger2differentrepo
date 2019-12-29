import { Pipe, PipeTransform } from '@angular/core';
import { MCTask } from '../core';

@Pipe({
  name: 'taskFilter',
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: MCTask[], filter: boolean[]): MCTask[] {
    if (!tasks || !filter) {
      return tasks;
    }
    return tasks.filter(task => {
      const isLib = task.name.endsWith('LIB') || task.name.endsWith('ULB');
      const cond1 = !isLib && filter[0];
      const cond2 = isLib && filter[1] && !task.state.endsWith('Globally');
      const cond3 = isLib && filter[2] && task.state.endsWith('Globally');
      const isUserTask = task.name.endsWith('.ULB') || task.name.endsWith('.UPG');
      const cond4 = isUserTask && filter[3];
      const isBackgroundTask = task.name.endsWith('.BKG');
      const cond5 = isBackgroundTask && filter[4];
      return cond1 || cond2 || cond3 || cond4 || cond5;
    });
  }
}
