import { TaskManagerModule } from './task-manager.module';

describe('TaskManagerModule', () => {
  let taskManagerModule: TaskManagerModule;

  beforeEach(() => {
    taskManagerModule = new TaskManagerModule();
  });

  it('should create an instance', () => {
    expect(taskManagerModule).toBeTruthy();
  });
});
