import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api_authService } from '../../services/api/api_auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string | null = null;
  successMessage: string | null = null;
  loading = false;

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: Api_authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Check if user was redirected from registration
    this.route.queryParams.subscribe((params) => {
      if (params['registered']) {
        this.successMessage =
          'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.';
      }
    });
  }

  sanitizeInput(value: string): string {
    return value.replace(/<[^>]*>?/gm, '').trim();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Sanitize inputs
    const email = this.sanitizeInput(this.loginForm.value.email);
    const password = this.sanitizeInput(this.loginForm.value.password);

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;

        if (!response) {
          this.error = 'Invalid server response';
          return;
        }

        if (response.id) {
          // We have an ID, redirect to OTP verification
          this.router.navigate(['/verify-otp'], {
            queryParams: {
              email: email, // Use the email from the form
              userId: response.id,
            },
          });
        } else {
          this.error = 'No ID in server response. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Login failed. Please try again.';
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}
