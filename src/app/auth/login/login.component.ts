import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api_authService } from '../../services/api_auth.service';

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

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.requireOtp) {
          // Redirect to OTP verification with email and userId
          this.router.navigate(['/verify-otp'], {
            queryParams: {
              email: this.loginForm.get('email')?.value,
              userId: response.userId,
            },
          });
        } else if (response.jwt) {
          // Store JWT and redirect to home
          localStorage.setItem('token', response.jwt);
          this.router.navigate(['/']);
        } else {
          this.error = 'Invalid server response';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Login failed. Please try again.';
      },
    });
  }
}
