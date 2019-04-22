import { TestBed } from '@angular/core/testing';

import { WordsService } from './words.service';

describe('WordsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WordsService = TestBed.get(WordsService);
    expect(service).toBeTruthy();
  });
});
