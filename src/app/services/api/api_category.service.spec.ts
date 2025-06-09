/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Api_categoryService } from './api_category.service';

describe('Service: Api_category', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api_categoryService],
    });
  });

  it('should ...', inject(
    [Api_categoryService],
    (service: Api_categoryService) => {
      expect(service).toBeTruthy();
    }
  ));
});
