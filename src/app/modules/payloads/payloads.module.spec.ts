import { PayloadsModule } from './payloads.module';

describe('PayloadsModule', () => {
  let payloadsModule: PayloadsModule;

  beforeEach(() => {
    payloadsModule = new PayloadsModule();
  });

  it('should create an instance', () => {
    expect(payloadsModule).toBeTruthy();
  });
});
