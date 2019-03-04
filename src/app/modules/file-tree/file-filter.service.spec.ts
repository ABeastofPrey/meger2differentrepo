import { TestBed } from '@angular/core/testing';

import { FileFilterService } from './file-filter.service';

describe('FileFilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileFilterService = TestBed.get(FileFilterService);
    expect(service).toBeTruthy();
  });
});
