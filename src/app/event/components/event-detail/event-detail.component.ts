import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Api_registrationService } from '../../../services/api/api_registration.service';
import { Event } from '../../../../interfaces/event.interface';
import { Registration } from '../../../../interfaces/registration.interface';

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
  userRegistrationId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: Api_eventService,
    public authService: Api_authService,
    private registrationService: Api_registrationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventDetails(+this.eventId);
        this.checkUserRoles();
      } else {
        this.error = "Identifiant d'événement manquant";
        this.loading = false;
      }
    });
  }

  checkUserRoles(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.hasRole('admin');
    this.isCommunityManager = this.authService.hasRole('cm');
    const isClient = this.authService.hasRole('client');
    if (!isClient) {
      this.registrationAvailable = false;
    }
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;
    this.eventService.getEvent(eventId.toString()).subscribe({
      next: (data: any) => {
        this.event = data && data.data ? data.data : data;
        this.loading = false;
        this.checkRegistrationAvailability();
        // Vérification d'inscription déplacée ici, après chargement de l'event et des rôles
        if (this.isLoggedIn && this.authService.hasRole('client')) {
          this.checkUserRegistration(eventId);
        }
      },
      error: (err: unknown) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.loading = false;
        console.error('Erreur:', err);
      },
    });
  }
  checkUserRegistration(eventId: number): void {
    if (!this.isLoggedIn) {
      this.userIsRegistered = false;
      return;
    }

    const user = this.authService.getUserFromToken();
    if (!user || !user.id) {
      console.error('User ID not available');
      this.userIsRegistered = false;
      return;
    }

    this.eventService
      .getEventRegistrationByUserId(eventId.toString(), user.id.toString())
      .subscribe({
        next: (registration: Registration | null) => {
          console.log(
            'Registration data:',
            registration,
            'userId:',
            user.id,
            'eventId:',
            eventId
          );
          if (registration && registration.id) {
            this.userIsRegistered = true;
            this.userRegistrationId = registration.id;
          } else {
            this.userIsRegistered = false;
            this.userRegistrationId = null;
          }
        },
        error: (error: any) => {
          console.error(
            'Error checking registration status:',
            error,
            'userId:',
            user.id,
            'eventId:',
            eventId
          );
          this.userIsRegistered = false;
          this.userRegistrationId = null;
        },
      });
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
      // Using the new create registration component
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

  // New methods for managing user registrations
  viewRegistration(): void {
    if (this.userRegistrationId) {
      this.router.navigate([
        '/events/registration/detail',
        this.userRegistrationId,
      ]);
    }
  }

  updateRegistration(): void {
    if (this.userRegistrationId) {
      this.router.navigate([
        '/events/registration/update',
        this.userRegistrationId,
      ]);
    }
  }

  cancelRegistration(): void {
    if (this.userRegistrationId) {
      this.router.navigate([
        '/events/registration/delete',
        this.userRegistrationId,
      ]);
    } else {
      console.error('Aucune inscription trouvée pour annulation.');
      // Optionnel : Afficher un message utilisateur
      // this.error = "Impossible d'annuler : aucune inscription trouvée.";
    }
  }
}
