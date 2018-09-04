import { HomeScreenModule } from './home-screen.module';

describe('HomeScreenModule', () => {
  let homeScreenModule: HomeScreenModule;

  beforeEach(() => {
    homeScreenModule = new HomeScreenModule();
  });

  it('should create an instance', () => {
    expect(homeScreenModule).toBeTruthy();
  });
});
