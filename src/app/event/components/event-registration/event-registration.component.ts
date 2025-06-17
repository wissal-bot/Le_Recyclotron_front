import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Registration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
})
export class EventRegistrationComponent implements OnInit {
  eventId: number | null = null;
  event: any = null;
  registrations: Registration[] = [];
  loading = false;
  eventLoading = true;
  error: string | null = null;

  isAdmin = false;
  isCommunityManager = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: Api_eventService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.isCommunityManager = this.authService.hasRole('cm');
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.eventId = +idParam;
        this.loadEventDetails(this.eventId);
        this.loadRegistrations(this.eventId);
      } else {
        this.error = "Identifiant d'événement manquant";
      }
    });
  }

  loadEventDetails(eventId: number): void {
    this.eventLoading = true;
    this.eventService.getEvent(eventId.toString()).subscribe({
      next: (data: any) => {
        this.event = data.data || data;
        this.eventLoading = false;
      },
      error: (err: any) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.eventLoading = false;
        console.error('Erreur:', err);
      },
    });
  }

  loadRegistrations(eventId: number): void {
    this.loading = true;
    this.eventService.getAllEventRegistrations(eventId.toString()).subscribe({
      next: (registrations: Registration[]) => {
        this.registrations = registrations;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des inscriptions';
        this.loading = false;
        console.error('Erreur:', err);
      },
    });
  }

  goBack(): void {
    if (this.eventId) {
      this.router.navigate(['/events/detail', this.eventId]);
    } else {
      this.router.navigate(['/events']);
    }
  }

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
