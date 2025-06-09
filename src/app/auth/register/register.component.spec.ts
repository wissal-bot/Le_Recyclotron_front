/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { Api_authService } from '../../services/api/api_auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: jasmine.SpyObj<Api_authService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('Api_authService', ['register']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [RegisterComponent],
      providers: [{ provide: Api_authService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate matching passwords', () => {
    component.registerForm.controls['name'].setValue('Test User');
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('Password123');
    component.registerForm.controls['confirmPassword'].setValue('Password456');

    expect(component.registerForm.valid).toBeFalsy();

    component.registerForm.controls['confirmPassword'].setValue('Password123');
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should call auth service on form submission', () => {
    authServiceMock.register.and.returnValue(of({ id: 'user-id' }));

    component.registerForm.controls['name'].setValue('Test User');
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('Password123');
    component.registerForm.controls['confirmPassword'].setValue('Password123');

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
    });
  });

  it('should handle registration error', () => {
    authServiceMock.register.and.returnValue(
      throwError(() => new Error('Registration failed'))
    );

    component.registerForm.controls['name'].setValue('Test User');
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('Password123');
    component.registerForm.controls['confirmPassword'].setValue('Password123');

    component.onSubmit();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });
});
