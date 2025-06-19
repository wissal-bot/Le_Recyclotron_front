import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  Registration,
  InputRegistration,
} from '../../../interfaces/registration.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_registrationService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createRegistration(data: InputRegistration): Observable<Registration> {
    return this.http.post<Registration>(`${this.API_URL}/registration`, data);
  }

  getRegistration(id: string): Observable<Registration> {
    return this.http.get<{ data: Registration }>(`${this.API_URL}/registration/${id}`).pipe(
      map((response) => response.data)
    );
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
