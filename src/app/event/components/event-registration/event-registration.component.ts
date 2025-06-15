import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { Api_registrationService } from '../../../services/api/api_registration.service';
import { InputRegistration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
})
export class EventRegistrationComponent implements OnInit {
  eventId: number | null = null;
  event: any = null;
  registrationForm: FormGroup;

  loading = false;
  eventLoading = true;
  submitting = false;
  success = false;
  error: string | null = null;
  registrationError: string | null = null;

  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: Api_authService,
    private registrationService: Api_registrationService
  ) {
    // Initialize form - simplified to only include number of persons
    this.registrationForm = this.fb.group({
      numberOfPersons: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user ID
    const user = this.authService.getUserFromToken();
    this.userId = user?.id || null;

    if (!this.userId) {
      this.error = 'Vous devez être connecté pour vous inscrire';
      return;
    }

    // Get event ID from route
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.eventId = +idParam;
        this.loadEventDetails(this.eventId);
      } else {
        this.error = "Identifiant d'événement manquant";
      }
    });
  }

  loadEventDetails(eventId: number): void {
    this.eventLoading = true;

    this.eventService.getEventById(eventId).subscribe({
      next: (data: any) => {
        this.event = data.data;
        this.eventLoading = false;

        // Check if registration is still available
        this.checkRegistrationAvailability();
      },
      error: (err: any) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.eventLoading = false;
        console.error('Erreur:', err);
      },
    });
  }

  checkRegistrationAvailability(): void {
    if (!this.event) return;

    // Check if event has passed
    const eventDate = new Date(this.event.date);
    const now = new Date();

    if (eventDate < now) {
      this.error =
        "L'inscription n'est plus disponible car l'événement est déjà passé";
      return;
    }

    // Check if capacity is reached
    const registeredCount =
      this.event.registeredCount ||
      (this.event.registrations ? this.event.registrations.length : 0);

    if (this.event.capacity && registeredCount >= this.event.capacity) {
      this.error = "L'événement est complet, les inscriptions sont fermées";
      return;
    }

    // Check if user is already registered
    if (this.userId && this.eventId) {
      this.checkExistingRegistration(this.userId, this.eventId);
    }
  }

  checkExistingRegistration(userId: number, eventId: number): void {
    this.loading = true;

    // Using the Api_registrationService to check if user is registered
    this.registrationService.checkUserRegistration(eventId, userId).subscribe({
      next: (isRegistered: boolean) => {
        if (isRegistered) {
          this.error = 'Vous êtes déjà inscrit à cet événement';
        }
        this.loading = false;
      },
      error: (err: any) => {
        // If the endpoint doesn't exist, fallback to getting all registrations
        this.registrationService.getRegistrationsByEventId(eventId).subscribe({
          next: (registrations: any) => {
            const isRegistered =
              Array.isArray(registrations) &&
              registrations.some((reg) => reg.userId === userId);

            if (isRegistered) {
              this.error = 'Vous êtes déjà inscrit à cet événement';
            }
            this.loading = false;
          },
          error: () => {
            console.error(
              "Erreur lors de la vérification de l'inscription:",
              err
            );
            this.loading = false;
          },
        });
      },
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.registrationForm.controls).forEach((key) => {
        const control = this.registrationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.userId || !this.eventId) {
      this.registrationError = "Informations d'inscription incomplètes";
      return;
    }

    this.submitting = true;
    this.registrationError = null;

    const registrationData: InputRegistration = {
      eventId: this.eventId,
      userId: this.userId,
      seats: this.registrationForm.value.numberOfPersons,
    };

    // Using Api_registrationService to register for the event
    this.registrationService.createRegistration(registrationData).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
      },
      error: (err: any) => {
        this.registrationError =
          "Erreur lors de l'inscription. Veuillez réessayer.";
        this.submitting = false;
        console.error("Erreur lors de l'inscription:", err);
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
