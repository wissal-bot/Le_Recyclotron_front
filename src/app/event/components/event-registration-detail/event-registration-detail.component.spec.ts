import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EventRegistrationDetailComponent } from './event-registration-detail.component';

describe('EventRegistrationDetailComponent', () => {
  let component: EventRegistrationDetailComponent;
  let fixture: ComponentFixture<EventRegistrationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EventRegistrationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventRegistrationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
