import { TestBed } from '@angular/core/testing';

import { PaperService } from './paper.service';

describe('PaperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaperService = TestBed.get(PaperService);
    expect(service).toBeTruthy();
  });
});
