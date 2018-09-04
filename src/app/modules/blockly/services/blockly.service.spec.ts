import { TestBed, inject } from '@angular/core/testing';

import { BlocklyService } from './blockly.service';

describe('BlocklyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlocklyService]
    });
  });

  it('should be created', inject([BlocklyService], (service: BlocklyService) => {
    expect(service).toBeTruthy();
  }));
});
