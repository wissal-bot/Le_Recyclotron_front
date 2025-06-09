/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Api_userService } from './api_user.service';

describe('Service: Api_user', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api_userService],
    });
  });

  it('should ...', inject([Api_userService], (service: Api_userService) => {
    expect(service).toBeTruthy();
  }));
});
