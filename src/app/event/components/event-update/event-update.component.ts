import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { PartialEvent } from '../../../../interfaces/event.interface';

@Component({
  selector: 'app-event-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-update.component.html',
  styleUrls: ['./event-update.component.css'],
})
export class EventUpdateComponent implements OnInit {
  eventId: string | null = null;
  eventForm: FormGroup;
  submitting = false;
  loading = true;
  error: string | null = null;
  isAuthorized = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: Api_eventService,
    private authService: Api_authService
  ) {
    // Initialize form
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      image: [''],
    });
  }

  ngOnInit(): void {
    // Check if user has admin or CM rights
    this.checkAuthorization();

    // Get event ID from route params
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventData(this.eventId);
      } else {
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
          "Vous n'avez pas les droits nécessaires pour modifier un événement";
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
          // Create date and time from event date
          const eventDate = new Date(evt.date);
          const dateString = eventDate.toISOString().split('T')[0];

          // Create time string in format HH:MM
          const hours = eventDate.getHours().toString().padStart(2, '0');
          const minutes = eventDate.getMinutes().toString().padStart(2, '0');
          const timeString = `${hours}:${minutes}`;
          // Fill form with event data
          this.eventForm.patchValue({
            title: evt.title,
            description: evt.description,
            date: dateString,
            time: timeString,
            image: evt.image,
          });
          this.loading = false;
        } else {
          this.error = 'Événement non trouvé';
          this.loading = false;
        }
      },
      error: (err: unknown) => {
        this.error = "Erreur lors du chargement de l'événement";
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid || !this.eventId) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.eventForm.controls).forEach((key) => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;
    const dateValue = this.eventForm.value.date;
    const timeValue = this.eventForm.value.time;
    const dateTimeValue = new Date(`${dateValue}T${timeValue}`);

    const eventData: PartialEvent = {
      title: this.eventForm.value.title,
      description: this.eventForm.value.description,
      date: dateTimeValue,
      image: this.eventForm.value.image,
    };

    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: (_response: unknown) => {
        this.submitting = false;
        this.router.navigate(['/events']);
      },
      error: (err: unknown) => {
        this.error = "Erreur lors de la mise à jour de l'événement.";
        this.submitting = false;
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
}
