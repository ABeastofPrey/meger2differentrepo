import { ToolsRoutingModule } from './tools-routing.module';

describe('ToolsRoutingModule', () => {
  let toolsRoutingModule: ToolsRoutingModule;

  beforeEach(() => {
    toolsRoutingModule = new ToolsRoutingModule();
  });

  it('should create an instance', () => {
    expect(toolsRoutingModule).toBeTruthy();
  });
});
