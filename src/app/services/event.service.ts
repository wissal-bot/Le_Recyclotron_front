import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {
    console.log('Event service API URL:', this.apiUrl);
  }

  getEvents(): Observable<any> {
    console.log('Fetching events from:', `${this.apiUrl}/event`);
    return this.http.get<any>(`${this.apiUrl}/event`);
  }

  getEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/event/${id}`);
  }

  // Récupérer les événements à venir en tenant compte de la date ET de l'heure
  getUpcomingEvents(): Observable<any[]> {
    return this.getEvents().pipe(
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
  getCurrentMonthEvents(): Observable<any[]> {
    return this.getEvents().pipe(
      map((response) => {
        // Extraire le tableau d'événements
        // ...existing code similaire à getUpcomingEvents()...
        let events: any[] = [];

        if (Array.isArray(response)) {
          events = response;
        } else if (response && typeof response === 'object') {
          // ... même code que dans getUpcomingEvents() ...
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
