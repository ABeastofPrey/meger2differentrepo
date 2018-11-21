import { IoMappingModule } from './io-mapping.module';

describe('IoMappingModule', () => {
  let ioMappingModule: IoMappingModule;

  beforeEach(() => {
    ioMappingModule = new IoMappingModule();
  });

  it('should create an instance', () => {
    expect(ioMappingModule).toBeTruthy();
  });
});
