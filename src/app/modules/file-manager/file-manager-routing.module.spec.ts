import { FileManagerRoutingModule } from './file-manager-routing.module';

describe('FileManagerRoutingModule', () => {
  let fileManagerRoutingModule: FileManagerRoutingModule;

  beforeEach(() => {
    fileManagerRoutingModule = new FileManagerRoutingModule();
  });

  it('should create an instance', () => {
    expect(fileManagerRoutingModule).toBeTruthy();
  });
});
