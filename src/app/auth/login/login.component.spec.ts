/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { Api_authService } from '../../services/api/api_auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<Api_authService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('Api_authService', ['login']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, LoginComponent],
      providers: [{ provide: Api_authService, useValue: authServiceMock }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should have valid form when filled correctly', () => {
    component.loginForm.controls['email'].setValue('user@example.com');
    component.loginForm.controls['password'].setValue('password123');
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call auth service on form submission', () => {
    authServiceMock.login.and.returnValue(of({ id: 'user-id' }));

    component.loginForm.controls['email'].setValue('user@example.com');
    component.loginForm.controls['password'].setValue('password123');

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should handle login error', () => {
    authServiceMock.login.and.returnValue(
      throwError(() => new Error('Login failed'))
    );

    component.loginForm.controls['email'].setValue('user@example.com');
    component.loginForm.controls['password'].setValue('password123');

    component.onSubmit();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });
});
