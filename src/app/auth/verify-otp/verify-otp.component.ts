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
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css'],
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  error: string | null = null;
  loading = false;
  email: string | null = null;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: Api_authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    // Get email and userId from route parameters
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email');
      this.id = params.get('userId');

      if (!this.email) {
        this.error = 'Email parameter is missing. Please go back to login.';
      }

      if (!this.id) {
        console.warn('UserId is missing. OTP verification might fail.');
      }
    });
  }

  onSubmit(): void {
    if (this.otpForm.invalid || !this.email) {
      return;
    }

    this.loading = true;
    this.error = null;

    const otpValue = this.otpForm.get('otp')?.value;

    this.authService
      .verifyOTP({
        otp: otpValue,
        id: this.id || '',
      })
      .subscribe({
        next: (response) => {
          // Store JWT token
          localStorage.setItem('token', response.jwt);

          // Navigate to home or dashboard
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Failed to verify OTP. Please try again.';
        },
      });
  }

  resendOtp(): void {
    if (!this.email) {
      this.error = 'Email is missing. Cannot resend OTP.';
      return;
    }

    // Implement OTP resend functionality here
    // This might need to be added to the auth service
  }
}
