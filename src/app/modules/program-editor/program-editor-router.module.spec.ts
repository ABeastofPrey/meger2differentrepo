import { ProgramEditorRouterModule } from './program-editor-router.module';

describe('ProgramEditorRouterModule', () => {
  let programEditorRouterModule: ProgramEditorRouterModule;

  beforeEach(() => {
    programEditorRouterModule = new ProgramEditorRouterModule();
  });

  it('should create an instance', () => {
    expect(programEditorRouterModule).toBeTruthy();
  });
});
