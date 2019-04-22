import { TestBed } from '@angular/core/testing';

import { PerfResultService } from './perf-result.service';

describe('PerfResultService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PerfResultService = TestBed.get(PerfResultService);
    expect(service).toBeTruthy();
  });
});
