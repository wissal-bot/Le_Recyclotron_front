/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Api_registrationService } from './api_registration.service';

describe('Service: Api_registration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Api_registrationService]
    });
  });

  it('should ...', inject([Api_registrationService], (service: Api_registrationService) => {
    expect(service).toBeTruthy();
  }));
});
