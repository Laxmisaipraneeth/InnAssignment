import { TestBed } from '@angular/core/testing';

import { HelperStoreService } from './helper-store.service';

describe('HelperStoreService', () => {
  let service: HelperStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelperStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
