import { SimulatorRoutingModule } from './simulator-routing.module';

describe('SimulatorRoutingModule', () => {
  let simulatorRoutingModule: SimulatorRoutingModule;

  beforeEach(() => {
    simulatorRoutingModule = new SimulatorRoutingModule();
  });

  it('should create an instance', () => {
    expect(simulatorRoutingModule).toBeTruthy();
  });
});
