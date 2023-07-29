import { TestBed } from '@angular/core/testing';

import { MagnifyService } from './magnify.service';

describe('MagnifyService', () => {
  let service: MagnifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagnifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
