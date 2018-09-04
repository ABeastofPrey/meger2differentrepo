import { SimulatorModule } from './simulator.module';

describe('SimulatorModule', () => {
  let simulatorModule: SimulatorModule;

  beforeEach(() => {
    simulatorModule = new SimulatorModule();
  });

  it('should create an instance', () => {
    expect(simulatorModule).toBeTruthy();
  });
});
