import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Api_registrationService } from '../../../services/api/api_registration.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Registration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-registration-detail.component.html',
  styleUrls: ['./event-registration-detail.component.css'],
})
export class EventRegistrationDetailComponent implements OnInit {
  registrationId: string | null = null;
  registration: Registration | null = null;
  loading = true;
  error: string | null = null;
  isOwner = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: Api_registrationService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check admin status
    this.isAdmin = this.authService.hasRole('admin');

    // Get registration ID from route
    this.route.paramMap.subscribe((params) => {
      this.registrationId = params.get('id');
      if (this.registrationId) {
        this.loadRegistrationDetails(this.registrationId);
      } else {
        this.error = "Identifiant d'inscription manquant";
        this.loading = false;
      }
    });
  }

  loadRegistrationDetails(id: string): void {
    this.loading = true;
    this.registrationService.getRegistration(id).subscribe({
      next: (registration: Registration) => {
        this.registration = registration;
        this.loading = false;
        this.checkOwnership();
      },
      error: (err: any) => {
        this.error = "Erreur lors du chargement des détails de l'inscription";
        this.loading = false;
        console.error('Erreur:', err);
      },
    });
  }

  checkOwnership(): void {
    if (!this.registration) return;

    const user = this.authService.getUserFromToken();
    if (!user) return;

    // Log pour debug
    console.log(
      'Comparaison ownership registration:',
      this.registration.userId,
      'user:',
      user.id
    );
    // Comparaison forcée en string
    this.isOwner = String(user.id) === String(this.registration.userId);

    if (!this.isOwner && !this.isAdmin) {
      this.error = "Vous n'êtes pas autorisé à voir cette inscription";
    }
  }

  onUpdate(): void {
    if (this.registrationId && (this.isOwner || this.isAdmin)) {
      this.router.navigate([
        '/events/registration/update',
        this.registrationId,
      ]);
    }
  }

  onDelete(): void {
    if (this.registrationId && (this.isOwner || this.isAdmin)) {
      this.router.navigate([
        '/events/registration/delete',
        this.registrationId,
      ]);
    }
  }

  goBack(): void {
    // Go to event detail page if we have event ID
    if (this.registration?.eventId) {
      this.router.navigate(['/events/detail', this.registration.eventId]);
    } else {
      // Otherwise just go back
      this.router.navigate(['/events']);
    }
  }

  // Format date for display
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Date inconnue';

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
