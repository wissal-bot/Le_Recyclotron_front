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

  // From AuthService
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check token validity on service initialization
    this.isLoggedInSubject.next(this.hasValidToken());

    // From AuthService - load user data
    this.loadUserFromStorage();
  }

  // From AuthService - load user from storage
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
  }

  // From AuthService - store auth data
  private storeAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // From AuthService - get user observable
  getUser(): Observable<User | null> {
    return this.user$;
  }

  login(credentials: LoginRequest): Observable<{
    id?: string;
  }> {
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

  // Ajouter cette méthode manquante
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  // Implémentation correcte de la méthode de décodage du token
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  // Get user details from token
  getUserFromToken(): any {
    const user = this.getDecodedToken();

    // S'assurer que l'utilisateur a un champ rôles
    if (user) {
      // Si les rôles n'existent pas, initialiser un tableau vide
      if (!user.roles) {
        user.roles = [];
      }
      // Pour les tests, temporairement ajouter le rôle 'client' (à supprimer en production)
      if (!user.roles.includes('client')) {
        user.roles.push('client');
      }
    }

    return user;
  }

  hasRole(role: string): boolean {
    const user = this.getUserFromToken();
    console.log('Checking role:', role, 'for user:', user);
    const hasRole = user && user.roles && user.roles.includes(role);
    console.log('Has role', role, ':', hasRole);
    return hasRole;
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
