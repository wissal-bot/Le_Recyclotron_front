import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EventRegistrationComponent } from './event-registration.component';
import { Api_authService } from '../../../services/api/api_auth.service';

describe('EventRegistrationComponent', () => {
  let component: EventRegistrationComponent;
  let fixture: ComponentFixture<EventRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EventRegistrationComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '1' }),
            params: of({ id: '1' }),
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        {
          provide: Api_authService,
          useValue: {
            hasRole: () => false,
            isLoggedIn: () => true,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
