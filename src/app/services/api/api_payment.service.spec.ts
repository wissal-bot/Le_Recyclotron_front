/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Api_paymentService } from './api_payment.service';

describe('Service: Api_payment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api_paymentService],
    });
  });

  it('should ...', inject(
    [Api_paymentService],
    (service: Api_paymentService) => {
      expect(service).toBeTruthy();
    }
  ));
});
