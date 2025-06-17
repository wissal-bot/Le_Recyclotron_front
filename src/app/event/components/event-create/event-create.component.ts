import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Api_eventService } from '../../../services/api/api_event.service';
import { Api_authService } from '../../../services/api/api_auth.service';
import { InputEvent } from '../../../../interfaces/event.interface';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.css'],
})
export class EventCreateComponent implements OnInit {
  eventForm: FormGroup;
  submitting = false;
  error: string | null = null;
  isAuthorized = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
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

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date for input
    const dateString = tomorrow.toISOString().split('T')[0];
    this.eventForm.get('date')?.setValue(dateString);

    // Set default time to noon
    this.eventForm.get('time')?.setValue('12:00');
  }

  checkAuthorization(): void {
    // Check if user is logged in and has admin or CM role
    if (this.authService.isLoggedIn()) {
      const isAdmin = this.authService.hasRole('admin');
      const isCM = this.authService.hasRole('cm');

      this.isAuthorized = isAdmin || isCM;

      if (!this.isAuthorized) {
        this.error =
          "Vous n'avez pas les droits nécessaires pour créer un événement";
      }
    } else {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.eventForm.controls).forEach((key) => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null; // Combine date and time
    const dateValue = this.eventForm.value.date;
    const timeValue = this.eventForm.value.time;
    const dateTimeValue = new Date(`${dateValue}T${timeValue}`);

    // Create event object based on InputEvent interface
    const eventData: InputEvent = {
      title: this.eventForm.value.title,
      description: this.eventForm.value.description,
      date: dateTimeValue,
      image: this.eventForm.value.image,
    };

    this.eventService.createEvent(eventData).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/events']);
      },
      error: (err: unknown) => {
        this.error = "Erreur lors de la création de l'événement.";
        this.submitting = false;
        console.error('Erreur:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/event']);
  }
}
