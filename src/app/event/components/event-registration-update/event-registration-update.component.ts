import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Api_registrationService } from '../../../services/api/api_registration.service';
import { Registration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-registration-update.component.html',
  styleUrls: ['./event-registration-update.component.css'],
})
export class EventRegistrationUpdateComponent implements OnInit {
  registrationId: string | null = null;
  registration: Registration | null = null;
  event: any = null;
  updateForm: FormGroup;

  loading = true;
  submitting = false;
  success = false;
  error: string | null = null;
  updateError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventService: Api_eventService,
    private authService: Api_authService,
    private registrationService: Api_registrationService
  ) {
    // Initialize form
    this.updateForm = this.fb.group({
      seats: [1, [Validators.required, Validators.min(1)]],
      active: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is a client or admin
    if (
      !this.authService.hasRole('client') &&
      !this.authService.hasRole('admin') &&
      !this.authService.hasRole('cm')
    ) {
      this.error = "Vous n'avez pas les permissions nécessaires";
      this.loading = false;
      return;
    }

    // Get registration ID from route
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.registrationId = idParam;
        this.loadRegistrationDetails(this.registrationId);
      } else {
        this.error = "Identifiant d'inscription manquant";
        this.loading = false;
      }
    });
  }

  loadRegistrationDetails(registrationId: string): void {
    this.loading = true;

    this.registrationService.getRegistration(registrationId).subscribe({
      next: (data: Registration) => {
        this.registration = data;

        // Load event details
        if (this.registration.eventId) {
          this.loadEventDetails(this.registration.eventId);
        } else {
          this.loading = false;
          this.error = "Détails de l'événement non disponibles";
        }

        // Set form values
        this.updateForm.patchValue({
          seats: this.registration.seats || 1,
          active: this.registration.active !== false, // Default to true if not specified
        });
      },
      error: (err: any) => {
        this.loading = false;
        this.error = "Erreur lors du chargement de l'inscription";
        console.error('Erreur:', err);
      },
    });
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;

    this.eventService.getEvent(eventId.toString()).subscribe({
      next: (data: any) => {
        this.event = data.data || data;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.updateForm.invalid || this.submitting || !this.registrationId) {
      return;
    }

    this.submitting = true;
    this.updateError = null;

    const formData = this.updateForm.value;

    this.registrationService
      .updateRegistration(this.registrationId, formData)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = true;
        },
        error: (err: any) => {
          this.submitting = false;
          this.updateError =
            'Erreur lors de la mise à jour. Veuillez réessayer.';
          console.error('Erreur:', err);
        },
      });
  }

  goBack(): void {
    // Adapt this based on your navigation requirements
    if (this.registration?.eventId) {
      this.router.navigate(['/events', this.registration.eventId]);
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
