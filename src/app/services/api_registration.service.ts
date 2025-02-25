import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Registration,
  InputRegistration,
} from '../../interfaces/registration.interface';

@Injectable({
  providedIn: 'root',
})
export class Api_registrationService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createRegistration(data: InputRegistration): Observable<Registration> {
    return this.http.post<Registration>(`${this.API_URL}/registration`, data);
  }

  getRegistration(id: string): Observable<Registration> {
    return this.http.get<Registration>(`${this.API_URL}/registration/${id}`);
  }

  updateRegistration(
    id: string,
    data: Partial<Registration>
  ): Observable<Registration> {
    return this.http.put<Registration>(
      `${this.API_URL}/registration/${id}`,
      data
    );
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/registration/${id}`);
  }
}
