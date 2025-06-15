import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Get all registrations for an event
  getRegistrationsByEventId(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.API_URL}/registration/event/${eventId}`
    );
  }

  // Check if a user is registered for an event
  checkUserRegistration(eventId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.API_URL}/registration/check/${eventId}/${userId}`
    );
  }
}
