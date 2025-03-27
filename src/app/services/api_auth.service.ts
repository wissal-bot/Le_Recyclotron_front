import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, map } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  OtpVerification,
  User,
  LoginResponse,
} from '../../interfaces/auth.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_authService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  login(
    credentials: LoginRequest
  ): Observable<{
    requireOtp: boolean;
    jwt?: string;
    email?: string;
    userId?: string;
  }> {
    console.log('Login attempt with:', credentials);
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials).pipe(
      map((response) => {
        // If response has requireOtp flag or we can detect it's an OTP flow
        if (
          response.requireOtp ||
          (response.message && response.message.includes('OTP'))
        ) {
          return {
            requireOtp: true,
            email: credentials.email,
            userId: response.userId || response.id, // Save the user ID from response
          };
        }

        // Normal login with JWT
        return {
          requireOtp: false,
          jwt: response.jwt,
        };
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<{ id: string }> {
    return this.http
      .post<{ id: string }>(`${this.API_URL}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  verifyOTP(data: OtpVerification): Observable<{ jwt: string }> {
    return this.http
      .post<{ jwt: string }>(`${this.API_URL}/auth/verify_otp`, data)
      .pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/auth/me`)
      .pipe(catchError(this.handleError));
  }

  revokeAllTokens(): Observable<void> {
    return this.http
      .post<void>(`${this.API_URL}/auth/revoke-all`, {})
      .pipe(catchError(this.handleError));
  }

  revokeUserTokens(userId: string): Observable<void> {
    return this.http
      .post<void>(`${this.API_URL}/auth/revoke-user/${userId}`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
