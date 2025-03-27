import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api_authService } from '../../services/api_auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: Api_authService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        termsAccepted: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.registerForm.value;

    this.authService.register({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;

        // Redirect to login page or OTP verification
        this.router.navigate(['/login'], {
          queryParams: { registered: true },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Registration failed. Please try again.';
      },
    });
  }
}
