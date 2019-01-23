import { TestBed } from '@angular/core/testing';

import { ColorsConverterService } from './colors-converter.service';

describe('ColorsConverterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColorsConverterService = TestBed.get(ColorsConverterService);
    expect(service).toBeTruthy();
  });
});
