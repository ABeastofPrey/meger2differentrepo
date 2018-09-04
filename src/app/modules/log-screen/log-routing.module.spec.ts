import { LogRoutingModule } from './log-routing.module';

describe('LogRoutingModule', () => {
  let logRoutingModule: LogRoutingModule;

  beforeEach(() => {
    logRoutingModule = new LogRoutingModule();
  });

  it('should create an instance', () => {
    expect(logRoutingModule).toBeTruthy();
  });
});
