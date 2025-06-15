import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Event } from '../../../../interfaces/event.interface';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error: string | null = null;
  eventId: string | null = null;

  isLoggedIn = false;
  isAdmin = false;
  isCommunityManager = false;
  registrationAvailable = true;
  userIsRegistered = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventDetails(+this.eventId);
      } else {
        this.error = "Identifiant d'événement manquant";
        this.loading = false;
      }
    });

    this.checkUserRoles();
  }

  checkUserRoles(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.isAdmin = this.authService.hasRole('admin');
      this.isCommunityManager = this.authService.hasRole('cm');

      // If user is logged in, check if already registered for this event
      if (this.eventId) {
        this.checkUserRegistration(+this.eventId);
      }
    }
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;

    this.eventService.getEventById(eventId).subscribe({
      next: (data: any) => {
        this.event = data.data;
        this.loading = false;

        // Check if event registration is still available (not full, not past)
        this.checkRegistrationAvailability();
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.loading = false;
        console.error('Erreur:', err);
      },
    });
  }

  checkUserRegistration(eventId: number): void {
    // Check if user is already registered for this event
    // Implementing stub only - adjust based on API
    this.userIsRegistered = false; // Default is not registered
  }

  checkRegistrationAvailability(): void {
    if (!this.event) return;

    // Check if event has passed
    const eventDate = new Date(this.event.date);
    const now = new Date();

    if (eventDate < now) {
      this.registrationAvailable = false;
      return;
    }
  }
  onRegister(): void {
    if (this.eventId) {
      this.router.navigate(['/events/register', this.eventId]);
    }
  }

  onEdit(): void {
    if (this.eventId) {
      this.router.navigate(['/events/update', this.eventId]);
    }
  }

  onDelete(): void {
    if (this.eventId) {
      this.router.navigate(['/events/delete', this.eventId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
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
