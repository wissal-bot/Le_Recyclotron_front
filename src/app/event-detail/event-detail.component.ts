import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { EventService } from '../services/event.service';
import { Api_authService } from '../services/api/api_auth.service';

// Interface pour l'événement
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  image?: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error: string | null = null;
  eventId: string | null = null;
  isLoggedIn: boolean = false;
  hasClientRole: boolean = false;
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventService: EventService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL courante pour le paramètre returnUrl
    this.currentUrl = window.location.pathname;

    // Observer l'état d'authentification
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;

      // Si l'utilisateur est connecté, vérifier son rôle
      if (loggedIn) {
        const user = this.authService.getUserFromToken();
        this.hasClientRole =
          user && user.roles ? user.roles.includes('client') : false;
      } else {
        this.hasClientRole = false;
      }
    });

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

    this.eventService.getEventById(parseInt(id)).subscribe({
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

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/event-placeholder.jpg';

    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      if (imageUrl.startsWith('/')) {
        return imageUrl;
      } else {
        return `assets/${imageUrl}`;
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
