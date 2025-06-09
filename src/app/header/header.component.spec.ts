import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { Api_authService } from '../services/api/api_auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: jasmine.SpyObj<Api_authService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('Api_authService', [
      'isLoggedIn',
      'getUserFromToken',
      'hasRole',
    ]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
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
  });

  it('should show logout option when logged in', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.getUserFromToken.and.returnValue({
      name: 'Test User',
      id: 1,
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logout-button')).toBeTruthy();
  });
});
