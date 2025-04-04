import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Api_eventService } from '../services/api/api_event.service';
import { Event } from '../../interfaces/event.interface';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error: string | null = null;
  eventId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventService: Api_eventService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventDetails(this.eventId);
      } else {
        this.error = 'Event ID not found';
        this.loading = false;
      }
    });
  }

  loadEventDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEvent(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.event = response.data;
        } else {
          this.event = response;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load event details. Please try again later.';
        this.loading = false;
        console.error('Error loading event:', err);
      },
    });
  }

  formatDate(date: Date): string {
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

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/event-placeholder.jpg';

    try {
      // If it's a full URL, use it directly
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      // If it's a relative path, make sure it has the correct structure
      if (imageUrl.startsWith('/')) {
        return imageUrl;
      } else {
        // If it doesn't start with /, add assets/ prefix
        return `assets/${imageUrl}`;
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
