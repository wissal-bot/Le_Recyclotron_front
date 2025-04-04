import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.API_URL}/events`; // Adapter selon l'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer tous les événements - méthode utilisée par event.component
  getEvents(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Récupérer un événement par son ID
  getEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // La méthode getUpcomingEvents est supprimée pour utiliser la même logique que dans event.component
  // qui filtre les événements côté client après les avoir récupérés avec getEvents()
}
