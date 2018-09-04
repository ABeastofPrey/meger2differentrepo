import { HelpRoutingModule } from './help-routing.module';

describe('HelpRoutingModule', () => {
  let helpRoutingModule: HelpRoutingModule;

  beforeEach(() => {
    helpRoutingModule = new HelpRoutingModule();
  });

  it('should create an instance', () => {
    expect(helpRoutingModule).toBeTruthy();
  });
});
