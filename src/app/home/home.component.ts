import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import { EventService } from '../services/event.service';

interface FeatureCard {
  title: string;
  description: string;
  iconSrc: string;
  routerLink: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  items: ItemWithCategories[] = [];
  loading = true;
  error: string | null = null;

  // Propriété pour stocker les événements à venir
  upcomingEvents: any[] = [];
  eventLoading = true;
  eventError: string | null = null;

  // Données pour les cartes de fonctionnalités
  featureCards: FeatureCard[] = [
    {
      title: 'Communauté',
      description:
        'Rejoignez notre communauté engagée pour un mode de vie durable et participez à nos ateliers et événements.',
      iconSrc: 'assets/icons/community.svg',
      routerLink: '/community',
    },
    {
      title: 'Boutique',
      description:
        "Découvrez notre sélection d'articles recyclés uniques à prix abordables pour un style éco-responsable.",
      iconSrc: 'assets/icons/shop.svg',
      routerLink: '/product-list',
    },
  ];

  constructor(
    private itemService: Api_itemService,
    private sanitizer: DomSanitizer,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadSalableItems();
    this.loadUpcomingEvents(); // Chargement des événements depuis l'API
  }

  loadSalableItems(): void {
    this.loading = true;
    this.error = null;

    // Using getItemByStatus to only get salable items
    this.itemService.getItemByStatus(0).subscribe({
      next: (response) => {
        // Check if response is an array, if not, extract the items array from the response
        if (Array.isArray(response)) {
          this.items = response;
        } else if (response && typeof response === 'object') {
          // If response is an object with data property
          const responseObj = response as any; // Type assertion to avoid TS errors

          if (responseObj.data) {
            // If response has a data property that's an array
            if (Array.isArray(responseObj.data)) {
              this.items = responseObj.data;
            } else {
              this.items = [responseObj.data];
            }
          } else {
            // Try to extract items from other common response formats
            const possibleArrays = ['items', 'results', 'records'];

            for (const key of possibleArrays) {
              if (key in responseObj && Array.isArray(responseObj[key])) {
                this.items = responseObj[key];
                break;
              }
            }

            // If still no items found, try to convert the object to an array
            if (this.items.length === 0) {
              const entries = Object.entries(responseObj);
              const itemValues = entries
                .filter(
                  ([key, value]) =>
                    typeof value === 'object' && value !== null && 'id' in value
                )
                .map(([_, value]) => value as ItemWithCategories);

              if (itemValues.length > 0) {
                this.items = itemValues;
              } else {
                console.warn(
                  'Could not extract items from response',
                  responseObj
                );
              }
            }
          }
        } else {
          console.error('Unexpected response format:', response);
        }

        this.loading = false;
        console.log('Loaded items:', this.items);
      },
      error: (err) => {
        this.error = 'Failed to load items. Please try again later.';
        this.loading = false;
        console.error('Error loading items:', err);
      },
    });
  }

  // Helper method to get the correct image URL
  getImageUrl(item: any): string {
    // Check if imageUrl exists and is not empty
    if (item && item.imageUrl) {
      // For local development, ensure image URLs are properly formatted
      try {
        // If it's a full URL, use it directly
        new URL(item.imageUrl);
        return item.imageUrl;
      } catch (e) {
        // If it's a relative path, make sure it has the correct structure
        if (item.imageUrl.startsWith('/')) {
          return item.imageUrl;
        } else {
          // If it doesn't start with /, add assets/ prefix
          return `assets/${item.imageUrl}`;
        }
      }
    }

    // Default placeholder image
    return 'assets/placeholder.png';
  }

  // Méthode pour charger les événements à venir, similaire à event.component
  loadUpcomingEvents(): void {
    this.eventLoading = true;
    this.eventError = null;

    // Utiliser la même méthode getEvents() que dans event.component
    this.eventService.getEvents().subscribe({
      next: (events) => {
        let allEvents: any[] = [];

        // Extraction du tableau d'événements (similaire à event.component)
        if (Array.isArray(events)) {
          allEvents = events;
        } else if (events && typeof events === 'object') {
          // Si la réponse est un objet contenant un tableau d'événements
          const eventsObj = events as any;

          if (eventsObj.data && Array.isArray(eventsObj.data)) {
            allEvents = eventsObj.data;
          } else {
            // Tentative d'extraction des événements d'autres formats de réponse possibles
            const possibleArrays = ['events', 'results', 'records'];

            for (const key of possibleArrays) {
              if (key in eventsObj && Array.isArray(eventsObj[key])) {
                allEvents = eventsObj[key];
                break;
              }
            }
          }
        }

        // Filtrer les événements à venir (date > aujourd'hui), comme dans event.component
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.upcomingEvents = allEvents
          .filter((event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) => {
            // Trier par date croissante
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        this.eventLoading = false;
        console.log('Événements chargés:', this.upcomingEvents);
      },
      error: (err) => {
        this.eventError = 'Impossible de charger les événements.';
        this.eventLoading = false;
        console.error('Erreur lors du chargement des événements:', err);
      },
    });
  }

  // Méthode pour formater la date des événements (identique à la méthode formatDate de event.component)
  formatEventDate(date: string | Date): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
