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
import { Api_authService } from '../../services/api/api_auth.service';

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

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: Api_authService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\-]+$/)],
        ],
        last_name: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\-]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
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

  sanitizeInput(value: string): string {
    // Trim and remove basic HTML tags
    return value.replace(/<[^>]*>?/gm, '').trim();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Sanitize all inputs
    const first_name = this.sanitizeInput(this.registerForm.value.first_name);
    const last_name = this.sanitizeInput(this.registerForm.value.last_name);
    const email = this.sanitizeInput(this.registerForm.value.email);
    const password = this.sanitizeInput(this.registerForm.value.password);

    this.authService
      .register({ email, password, first_name, last_name })
      .subscribe({
        next: (response) => {
          this.loading = false;

          // Redirect to login page or OTP verification
          this.router.navigate(['/login'], {
            queryParams: { registered: true },
          });
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
          this.error = err.message || 'Registration failed. Please try again.';
        },
      });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
