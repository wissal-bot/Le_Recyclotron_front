/* tslint:disable:no-unused-variable */

import { TestBed, waitForAsync, inject } from '@angular/core/testing';
import { Api_authService } from './api_auth.service';

describe('Service: Api_auth', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Api_authService]
    });
  });

  it('should ...', inject([Api_authService], (service: Api_authService) => {
    expect(service).toBeTruthy();
  }));
});
