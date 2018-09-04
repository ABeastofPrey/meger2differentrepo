import { ErrorHistoryRoutingModule } from './error-history-routing.module';

describe('ErrorHistoryRoutingModule', () => {
  let errorHistoryRoutingModule: ErrorHistoryRoutingModule;

  beforeEach(() => {
    errorHistoryRoutingModule = new ErrorHistoryRoutingModule();
  });

  it('should create an instance', () => {
    expect(errorHistoryRoutingModule).toBeTruthy();
  });
});
