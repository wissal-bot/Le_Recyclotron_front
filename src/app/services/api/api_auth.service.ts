import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  throwError,
  catchError,
  map,
  tap,
  BehaviorSubject,
} from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  OtpVerification,
  User,
  LoginResponse,
} from '../../../interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Api_authService {
  private readonly API_URL = environment.API_URL;
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check token validity on service initialization
    this.isLoggedInSubject.next(this.hasValidToken());
  }

  login(credentials: LoginRequest): Observable<{
    id?: string;
  }> {
    console.log('Login attempt with:', credentials);
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('Login API response:', response);
      }),
      map((response) => {
        // Handle null or undefined response
        if (!response) {
          console.error('Received null or undefined response from login');
          return {
            id: undefined,
          };
        }

        // Return just the ID for OTP verification
        return {
          id: response.id || response.userId,
        };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return this.handleError(error);
      })
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
      .pipe(
        tap((response) => {
          // Log the complete response before processing
          console.log('OTP verification API response:', response);

          if (response && response.jwt) {
            this.storeToken(response.jwt);
            this.isLoggedInSubject.next(true);
          } else {
            console.warn('Missing JWT in OTP verification response:', response);
          }
        }),
        catchError((error) => {
          console.error('OTP verification error:', error);
          return this.handleError(error);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/auth/me`)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  revokeAllTokens(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/revoke-all`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.isLoggedInSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  revokeUserTokens(userId: string): Observable<void> {
    return this.http
      .post<void>(`${this.API_URL}/auth/revoke-user/${userId}`, {})
      .pipe(catchError(this.handleError));
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Store token in localStorage
  private storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Check if token exists and is not expired
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiryTime;
    } catch (e) {
      console.error('Error decoding token:', e);
      return false;
    }
  }

  // Get user details from token
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format: not a JWT');
        return null;
      }
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      localStorage.removeItem('token'); // Clear invalid token
      this.isLoggedInSubject.next(false);
      return null;
    }
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
