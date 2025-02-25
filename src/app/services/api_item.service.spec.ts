/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { Api_itemService } from './api_item.service';

describe('Service: Api_item', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Api_itemService],
    });
  });

  it('should ...', inject([Api_itemService], (service: Api_itemService) => {
    expect(service).toBeTruthy();
  }));
});
