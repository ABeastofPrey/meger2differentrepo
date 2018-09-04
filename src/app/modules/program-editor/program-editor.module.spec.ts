import { ProgramEditorModule } from './program-editor.module';

describe('ProgramEditorModule', () => {
  let programEditorModule: ProgramEditorModule;

  beforeEach(() => {
    programEditorModule = new ProgramEditorModule();
  });

  it('should create an instance', () => {
    expect(programEditorModule).toBeTruthy();
  });
});
