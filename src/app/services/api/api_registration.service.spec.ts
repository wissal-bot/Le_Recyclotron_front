/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Api_registrationService } from './api_registration.service';

describe('Service: Api_registration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api_registrationService],
    });
  });

  it('should ...', inject(
    [Api_registrationService],
    (service: Api_registrationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
