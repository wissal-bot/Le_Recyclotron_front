import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Api_registrationService } from '../../../services/api/api_registration.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Registration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration-delete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-registration-delete.component.html',
  styleUrls: ['./event-registration-delete.component.css'],
})
export class EventRegistrationDeleteComponent implements OnInit {
  registrationId: string | null = null;
  registration: Registration | null = null;
  loading = true;
  deleting = false;
  error: string | null = null;
  success = false;
  isOwner = false;
  eventId: number | null = null;

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
        this.eventId = registration.eventId;
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

    // Check if the current user is the owner of the registration or is an admin
    this.isOwner =
      user.id === this.registration.userId || this.authService.hasRole('admin');

    if (!this.isOwner) {
      this.error = "Vous n'êtes pas autorisé à annuler cette inscription";
    }
  }

  confirmDelete(): void {
    if (!this.registrationId || this.deleting || !this.isOwner) return;

    this.deleting = true;
    this.error = null;

    this.registrationService.deleteRegistration(this.registrationId).subscribe({
      next: () => {
        this.deleting = false;
        this.success = true;
      },
      error: (err: any) => {
        this.deleting = false;
        this.error = "Erreur lors de l'annulation de l'inscription";
        console.error('Erreur:', err);
      },
    });
  }

  goBack(): void {
    if (this.success) {
      // If deletion was successful, navigate back to the event detail page
      if (this.eventId) {
        this.router.navigate(['/events/detail', this.eventId]);
      } else {
        this.router.navigate(['/events']);
      }
    } else {
      // Just go back in history
      window.history.back();
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
