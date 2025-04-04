import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, InputEvent } from '../../../interfaces/event.interface';
import { Registration } from '../../../interfaces/registration.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_eventService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createEvent(eventData: InputEvent): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/event`, eventData);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/event`);
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/event/${id}`);
  }

  updateEvent(id: string, eventData: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/event/${id}`, eventData);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/event/${id}`);
  }

  getAllEventRegistrations(id: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.API_URL}/event/${id}/registrations`
    );
  }
}
