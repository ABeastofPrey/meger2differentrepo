import { TestBed, inject } from '@angular/core/testing';

import { ProjectManagerService } from './project-manager.service';

describe('ProjectManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectManagerService]
    });
  });

  it('should be created', inject([ProjectManagerService], (service: ProjectManagerService) => {
    expect(service).toBeTruthy();
  }));
});
