import { TaskManagerRoutingModule } from './task-manager-routing.module';

describe('TaskManagerRoutingModule', () => {
  let taskManagerRoutingModule: TaskManagerRoutingModule;

  beforeEach(() => {
    taskManagerRoutingModule = new TaskManagerRoutingModule();
  });

  it('should create an instance', () => {
    expect(taskManagerRoutingModule).toBeTruthy();
  });
});
