import { TpModule } from './tp.module';

describe('TpModule', () => {
  let tpModule: TpModule;

  beforeEach(() => {
    tpModule = new TpModule();
  });

  it('should create an instance', () => {
    expect(tpModule).toBeTruthy();
  });
});
