import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event, InputEvent } from '../../../interfaces/event.interface';
import { Registration } from '../../../interfaces/registration.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_eventService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {
    console.log('Event service API URL:', this.API_URL);
  }

  // Original api_event.service.ts methods
  createEvent(eventData: InputEvent): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/event`, eventData);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http
      .get<
        | Event[]
        | {
            data?: Event[];
            events?: Event[];
            results?: Event[];
            records?: Event[];
            items?: Event[];
            id?: string;
          }
      >(`${this.API_URL}/event`)
      .pipe(
        map((response): Event[] => {
          let events: Event[] = [];
          if (Array.isArray(response)) {
            events = response;
          } else if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
              events = response.data;
            } else if (Array.isArray(response.events)) {
              events = response.events;
            } else if (Array.isArray(response.results)) {
              events = response.results;
            } else if (Array.isArray(response.records)) {
              events = response.records;
            } else if (Array.isArray(response.items)) {
              events = response.items;
            } else if ('id' in response) {
              events = [response as Event];
            }
          }
          return events;
        })
      );
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

  getEventRegistrationByUserId(
    eventId: string,
    userId: string
  ): Observable<Registration | null> {
    return this.http.get<Registration | null>(
      `${this.API_URL}/event/${eventId}/registrations/${userId}`
    );
  }

  // Récupérer les événements à venir en tenant compte de la date ET de l'heure
  getUpcomingEvents(): Observable<Event[]> {
    return this.getAllEvents().pipe(
      map((response) => {
        // Extraire le tableau d'événements
        let events: any[] = [];

        if (Array.isArray(response)) {
          events = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as any;

          if (responseObj.data && Array.isArray(responseObj.data)) {
            events = responseObj.data;
          } else {
            // Tentative d'extraction des événements d'autres formats de réponse possibles
            const possibleArrays = ['events', 'results', 'records', 'items'];

            for (const key of possibleArrays) {
              if (key in responseObj && Array.isArray(responseObj[key])) {
                events = responseObj[key];
                break;
              }
            }

            // Si on n'a toujours pas trouvé les événements, essayons de voir si l'objet lui-même est utilisable
            if (events.length === 0 && responseObj.id) {
              events = [responseObj];
            }
          }
        }

        // Obtenir la date et l'heure actuelles
        const now = new Date();

        // Filtrer les événements dont la date et l'heure sont ultérieures à maintenant
        const upcomingEvents = events.filter((event) => {
          if (!event.date) return false;

          const eventDateTime = new Date(event.date);
          return eventDateTime > now;
        });

        // Trier par date et heure croissantes
        return upcomingEvents.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      })
    );
  }

  // Récupérer les événements du mois courant qui ne sont pas encore passés
  getCurrentMonthEvents(): Observable<Event[]> {
    return this.getAllEvents().pipe(
      map((response) => {
        // Extraire le tableau d'événements
        let events: any[] = [];

        if (Array.isArray(response)) {
          events = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as any;

          if (responseObj.data && Array.isArray(responseObj.data)) {
            events = responseObj.data;
          } else {
            // Tentative d'extraction des événements d'autres formats de réponse possibles
            const possibleArrays = ['events', 'results', 'records', 'items'];

            for (const key of possibleArrays) {
              if (key in responseObj && Array.isArray(responseObj[key])) {
                events = responseObj[key];
                break;
              }
            }

            // Si on n'a toujours pas trouvé les événements, essayons de voir si l'objet lui-même est utilisable
            if (events.length === 0 && responseObj.id) {
              events = [responseObj];
            }
          }
        }

        // Obtenir la date et l'heure actuelles
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filtrer les événements du mois courant qui ne sont pas encore passés
        const currentMonthEvents = events.filter((event) => {
          if (!event.date) return false;

          const eventDateTime = new Date(event.date);
          const eventMonth = eventDateTime.getMonth();
          const eventYear = eventDateTime.getFullYear();

          return (
            eventMonth === currentMonth &&
            eventYear === currentYear &&
            eventDateTime > now
          );
        });

        // Trier par date et heure croissantes
        return currentMonthEvents.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      })
    );
  }
}
