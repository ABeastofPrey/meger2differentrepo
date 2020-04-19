import { TestBed } from '@angular/core/testing';

import { FwTranslatorService } from './fw-translator.service';

describe('FwTranslatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FwTranslatorService = TestBed.get(FwTranslatorService);
    expect(service).toBeTruthy();
  });
});
