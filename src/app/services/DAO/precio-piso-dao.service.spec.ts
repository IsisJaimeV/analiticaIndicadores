import { TestBed } from '@angular/core/testing';

import { PrecioPisoDAOService } from './precio-piso-dao.service';

describe('PrecioPisoDAOService', () => {
  let service: PrecioPisoDAOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecioPisoDAOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
