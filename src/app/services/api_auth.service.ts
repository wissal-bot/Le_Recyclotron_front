import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  OtpVerification,
  User,
} from '../../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class Api_authService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(
      `${this.API_URL}/auth/login`,
      credentials
    );
  }

  register(userData: RegisterRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(
      `${this.API_URL}/auth/register`,
      userData
    );
  }

  verifyOTP(data: OtpVerification): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(
      `${this.API_URL}/auth/verify_otp`,
      data
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`);
  }

  revokeAllTokens(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/revoke-all`, {});
  }

  revokeUserTokens(userId: string): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/auth/revoke-user/${userId}`,
      {}
    );
  }
}
