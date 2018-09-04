import { ConfigurationRoutingModule } from './configuration-routing.module';

describe('ConfigurationRoutingModule', () => {
  let configurationRoutingModule: ConfigurationRoutingModule;

  beforeEach(() => {
    configurationRoutingModule = new ConfigurationRoutingModule();
  });

  it('should create an instance', () => {
    expect(configurationRoutingModule).toBeTruthy();
  });
});
