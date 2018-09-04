import { TestBed, inject } from '@angular/core/testing';

import { ProgramEditorService } from './program-editor.service';

describe('ProgramEditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProgramEditorService]
    });
  });

  it('should be created', inject([ProgramEditorService], (service: ProgramEditorService) => {
    expect(service).toBeTruthy();
  }));
});
