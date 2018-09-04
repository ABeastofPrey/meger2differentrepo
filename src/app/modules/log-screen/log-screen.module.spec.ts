import { LogScreenModule } from './log-screen.module';

describe('LogScreenModule', () => {
  let logScreenModule: LogScreenModule;

  beforeEach(() => {
    logScreenModule = new LogScreenModule();
  });

  it('should create an instance', () => {
    expect(logScreenModule).toBeTruthy();
  });
});
