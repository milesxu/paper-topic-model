import { TestBed } from '@angular/core/testing';

import { ConferencesService } from './conferences.service';

describe('ConferencesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConferencesService = TestBed.get(ConferencesService);
    expect(service).toBeTruthy();
  });
});
