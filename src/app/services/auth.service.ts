import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface User {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.API_URL;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        const user = response.user || {};
        if (user) {
          this.userSubject.next({
            ...user,
            roles: user.roles || [],
          });
          this.storeAuthData(response.token, user);
        }
      })
    );
  }

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

  private storeAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getUser(): Observable<User | null> {
    return this.user$;
  }
}
