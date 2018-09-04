import { TpRoutingModule } from './tp-routing.module';

describe('TpRoutingModule', () => {
  let tpRoutingModule: TpRoutingModule;

  beforeEach(() => {
    tpRoutingModule = new TpRoutingModule();
  });

  it('should create an instance', () => {
    expect(tpRoutingModule).toBeTruthy();
  });
});
