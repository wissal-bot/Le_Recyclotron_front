/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Api_eventService } from './api_event.service';

describe('Service: Api_event', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api_eventService],
    });
  });

  it('should ...', inject([Api_eventService], (service: Api_eventService) => {
    expect(service).toBeTruthy();
  }));
});
