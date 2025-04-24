import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Removed RouterLink import
import { EventService } from '../services/event.service';
import { Api_authService } from '../services/api/api_auth.service';
import { Api_registrationService } from '../services/api/api_registration.service';
import { InputRegistration } from '../../interfaces/registration.interface'; // Adjust the import path as necessary

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Removed RouterLink
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
})
export class EventRegistrationComponent implements OnInit {
  eventId: string | null = null;
  event: any = null;
  registrationForm: FormGroup;
  loading = false;
  submitting = false;
  success = false;
  error: string | null = null;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: Api_authService,
    private registrationService: Api_registrationService
  ) {
    this.registrationForm = this.fb.group({
      numberOfPlaces: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    // Vérifiez si l'utilisateur est connecté et a le rôle client
    const isLoggedIn = this.authService.isLoggedIn();
    const hasClientRole = this.authService.hasRole('client');

    if (!isLoggedIn || !hasClientRole) {
      this.router.navigate(['/event']);
      return;
    }

    // Récupérer l'ID de l'événement depuis l'URL
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventDetails(this.eventId);
      } else {
        this.error = "ID de l'événement non trouvé";
      }
    });

    // Récupérer l'ID de l'utilisateur
    const user = this.authService.getUserFromToken();
    if (user) {
      this.userId = user.id;
    }
  }

  loadEventDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(parseInt(id)).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.event = response.data;
        } else {
          this.event = response;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Impossible de charger les détails de l'événement.";
        this.loading = false;
        console.error('Error loading event:', err);
      },
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    // Vérifier si les données nécessaires sont présentes
    if (!this.userId) {
      this.error =
        'Identification utilisateur manquante. Veuillez vous reconnecter.';
      return;
    }

    if (!this.eventId) {
      this.error = "Identification de l'événement manquante.";
      return;
    }

    const numberOfPlaces = this.registrationForm.value.numberOfPlaces;
    if (!numberOfPlaces || numberOfPlaces < 1) {
      this.error = 'Veuillez spécifier un nombre valide de places.';
      return;
    }

    this.submitting = true;
    this.error = null;

    // Préparer les données pour l'inscription
    const registrationData: InputRegistration = {
      userId: this.userId.toString(),
      eventId: this.eventId.toString(),
      seats: numberOfPlaces,
    };

    // Utiliser le service d'inscription pour envoyer la requête API
    console.log('Registration data:', registrationData);
    this.registrationService.createRegistration(registrationData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        console.log('Registration successful:', response);
      },
      error: (err) => {
        this.submitting = false;
        this.error =
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
        console.error('Registration error:', err);
      },
    });
  }

  goToEventDetails(): void {
    this.router.navigate(['/event', this.eventId]);
  }
}
