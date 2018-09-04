import { BlocklyModule } from './blockly.module';

describe('BlocklyModule', () => {
  let blocklyModule: BlocklyModule;

  beforeEach(() => {
    blocklyModule = new BlocklyModule();
  });

  it('should create an instance', () => {
    expect(blocklyModule).toBeTruthy();
  });
});
