import { TestBed } from '@angular/core/testing';

import { RandomAvatarServiceService } from './random-avatar-service.service';

describe('RandomAvatarServiceService', () => {
  let service: RandomAvatarServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomAvatarServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
