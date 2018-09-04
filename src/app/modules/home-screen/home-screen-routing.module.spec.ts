import { HomeScreenRoutingModule } from './home-screen-routing.module';

describe('HomeScreenRoutingModule', () => {
  let homeScreenRoutingModule: HomeScreenRoutingModule;

  beforeEach(() => {
    homeScreenRoutingModule = new HomeScreenRoutingModule();
  });

  it('should create an instance', () => {
    expect(homeScreenRoutingModule).toBeTruthy();
  });
});
