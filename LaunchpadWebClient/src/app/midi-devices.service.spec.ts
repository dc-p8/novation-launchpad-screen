import { TestBed } from '@angular/core/testing';

import { MidiDevicesService } from './midi-devices.service';

describe('MidiDevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MidiDevicesService = TestBed.get(MidiDevicesService);
    expect(service).toBeTruthy();
  });
});
