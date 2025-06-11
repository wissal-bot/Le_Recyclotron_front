import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';

import { HeaderComponent } from './header.component';
import { Api_authService } from '../services/api/api_auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;  let authServiceMock: jasmine.SpyObj<Api_authService>;
  let isLoggedInSubject: BehaviorSubject<boolean>;
  
  beforeEach(() => {
    isLoggedInSubject = new BehaviorSubject<boolean>(false);
    
    authServiceMock = jasmine.createSpyObj(
      'Api_authService',
      ['isLoggedIn', 'getUserFromToken', 'hasRole'],
      { isLoggedIn$: isLoggedInSubject.asObservable() }
    );

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HeaderComponent],
      providers: [{ provide: Api_authService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login option when not logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[routerLink="/login"]')).toBeTruthy();
  });  it('should show logout option when logged in', () => {
    // Mock auth service responses
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.getUserFromToken.and.returnValue({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      id: 1,
    });
    
    // Simulate the auth service emitting a logged in state
    isLoggedInSubject.next(true);
    
    // Force the profile menu to be open
    component.profileMenuOpen = true;
    
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Now we can find the logout element
    expect(compiled.querySelector('.dropdown-item .logout-icon')).toBeTruthy();
  });
});
