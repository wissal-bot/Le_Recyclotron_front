import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';

@Component({
  selector: 'app-event-delete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-delete.component.html',
  styleUrls: ['./event-delete.component.css'],
})
export class EventDeleteComponent implements OnInit {
  eventId: string | null = null;
  event: any = null;
  loading = true;
  deleting = false;
  error: string | null = null;
  isAuthorized = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventService: Api_eventService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    // Check if user has admin or CM rights
    this.checkAuthorization();

    // Get event ID from route params
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId && this.isAuthorized) {
        this.loadEventData(this.eventId);
      } else if (!this.eventId) {
        this.error = "Identifiant d'événement manquant";
        this.loading = false;
      }
    });
  }

  checkAuthorization(): void {
    // Check if user is logged in and has admin or CM role
    if (this.authService.isLoggedIn()) {
      const isAdmin = this.authService.hasRole('admin');
      const isCM = this.authService.hasRole('cm');

      this.isAuthorized = isAdmin || isCM;

      if (!this.isAuthorized) {
        this.error =
          "Vous n'avez pas les droits nécessaires pour supprimer un événement";
        this.loading = false;
      }
    } else {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
    }
  }

  loadEventData(eventId: string): void {
    const id = parseInt(eventId, 10);

    if (isNaN(id)) {
      this.error = "Identifiant d'événement invalide";
      this.loading = false;
      return;
    }
    this.eventService.getEvent(id.toString()).subscribe({
      next: (event: any) => {
        const evt = event.data || event;
        if (evt) {
          this.event = evt;
          this.loading = false;
        } else {
          this.error = 'Événement non trouvé';
          this.loading = false;
        }
      },
      error: (err: unknown) => {
        console.error('Error loading event:', err);
        this.error = "Erreur lors du chargement de l'événement";
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.eventId) {
      this.error = "Identifiant d'événement manquant, impossible de supprimer";
      return;
    }

    this.deleting = true;
    this.error = null;

    const id = parseInt(this.eventId, 10);
    this.eventService.deleteEvent(id.toString()).subscribe({
      next: (_response: unknown) => {
        this.deleting = false;
        this.router.navigate(['/events']);
      },
      error: (err: unknown) => {
        this.deleting = false;
        this.error = "Erreur lors de la suppression de l'événement.";
        console.error('Erreur:', err);
      },
    });
  }
  cancel(): void {
    if (this.eventId) {
      this.router.navigate(['/events/detail', this.eventId]);
    } else {
      this.router.navigate(['/events']);
    }
  }
  // Format date for display
  formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  }
}
