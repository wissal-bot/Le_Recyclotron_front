/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { Api_categoryService } from './api_category.service';

describe('Service: Api_category', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Api_categoryService]
    });
  });

  it('should ...', inject([Api_categoryService], (service: Api_categoryService) => {
    expect(service).toBeTruthy();
  }));
});
