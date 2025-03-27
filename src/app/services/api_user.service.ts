import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUser } from '../../interfaces/user.interface';
import { Payment } from '../../interfaces/payment.interface';
import { Registration } from '../../interfaces/registration.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_userService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createUser(createUser: CreateUser, roles: number[]): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, { createUser, roles });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  addUserRoles(userId: string, roles: number[]): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/${userId}/roles`, {
      roles,
    });
  }

  removeUserRoles(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/users/${userId}/roles/${roleId}`
    );
  }

  getUserPayments(id: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.API_URL}/users/${id}/payments`);
  }

  getUserRegistrations(id: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.API_URL}/users/${id}/registrations`
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/users/forgot-password`, {
      email,
    });
  }

  resetPassword(data: {
    email: string;
    tempCode: string;
    newPassword: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/users/reset-password`, data);
  }
}
