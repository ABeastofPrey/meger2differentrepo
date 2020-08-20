import { TestBed, async, inject } from '@angular/core/testing';

import { JogScreenCanDeactivateGuard } from './jog-screen-can-deactivate.guard';

describe('JogScreenCanDeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JogScreenCanDeactivateGuard]
    });
  });

  it('should ...', inject([JogScreenCanDeactivateGuard], (guard: JogScreenCanDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));
});
