import { TestBed, inject } from '@angular/core/testing';

import { SimulatorService } from './simulator.service';

describe('SimulatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimulatorService]
    });
  });

  it('should be created', inject([SimulatorService], (service: SimulatorService) => {
    expect(service).toBeTruthy();
  }));
});
