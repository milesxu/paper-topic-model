import { TestBed } from '@angular/core/testing';

import { DistributeService } from './distribute.service';

describe('DistributeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DistributeService = TestBed.get(DistributeService);
    expect(service).toBeTruthy();
  });
});
