import { TestBed } from '@angular/core/testing';

import { ReceiveDataService } from './receive-data.service';

describe('ReceiveDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiveDataService = TestBed.get(ReceiveDataService);
    expect(service).toBeTruthy();
  });
});
