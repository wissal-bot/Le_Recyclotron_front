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
import { InputRegistration } from '../../../../interfaces/registration.interface';

@Component({
  selector: 'app-event-registration-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-registration-create.component.html',
  styleUrls: ['./event-registration-create.component.css'],
})
export class EventRegistrationCreateComponent implements OnInit {
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
    private eventService: Api_eventService,
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

    // Check if user is a client
    if (!this.authService.hasRole('client')) {
      this.error = "Seuls les clients peuvent s'inscrire aux événements";
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

    this.eventService.getEvent(eventId.toString()).subscribe({
      next: (data: any) => {
        this.event = data.data || data;
        this.eventLoading = false;

        // Check if registration is still available
        this.checkRegistrationAvailability();

        // Check if user is already registered
        this.checkUserRegistration();
      },
      error: (err: unknown) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.eventLoading = false;
      },
    });
  }

  checkRegistrationAvailability(): void {
    if (!this.event) return;

    // Check if event has passed
    const eventDate = new Date(this.event.date);
    const now = new Date();

    if (eventDate < now) {
      this.error = "L'événement est déjà passé, les inscriptions sont fermées";
      return;
    }

    // You might check other conditions like maximum capacity here
  }

  checkUserRegistration(): void {
    if (!this.eventId || !this.userId) return;
    this.eventService
      .getEventRegistrationByUserId(
        this.eventId.toString(),
        this.userId.toString()
      )
      .subscribe({
        next: (registration: any) => {
          if (registration && registration.id) {
            this.registrationError = 'Vous êtes déjà inscrit à cet événement.';
          } else {
            this.registrationError = null;
          }
        },
        error: () => {
          this.registrationError = null;
        },
      });
  }

  onSubmit(): void {
    if (
      this.registrationForm.invalid ||
      this.submitting ||
      !this.eventId ||
      !this.userId
    ) {
      return;
    }

    this.submitting = true;
    this.registrationError = null;

    const formData = this.registrationForm.value;

    // Correction : retire 'active' de InputRegistration
    const registrationData: InputRegistration = {
      seats: this.registrationForm.value.numberOfPersons,
      userId: this.userId!,
      eventId: this.eventId!,
    };

    this.registrationService.createRegistration(registrationData).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
      },
      error: (err: any) => {
        this.submitting = false;
        this.registrationError =
          "Erreur lors de l'inscription. Veuillez réessayer.";
        console.error('Erreur:', err);
      },
    });
  }

  goBack(): void {
    if (this.eventId) {
      this.router.navigate(['/events', String(this.eventId)]).catch((err) => {
        console.error(
          "Navigation vers le détail de l'événement échouée :",
          err
        );
        this.router.navigate(['/events']);
      });
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
