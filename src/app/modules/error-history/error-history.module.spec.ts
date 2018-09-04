import { ErrorHistoryModule } from './error-history.module';

describe('ErrorHistoryModule', () => {
  let errorHistoryModule: ErrorHistoryModule;

  beforeEach(() => {
    errorHistoryModule = new ErrorHistoryModule();
  });

  it('should create an instance', () => {
    expect(errorHistoryModule).toBeTruthy();
  });
});
