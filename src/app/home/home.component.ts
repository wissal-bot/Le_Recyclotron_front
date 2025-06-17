import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
// Correction du chemin d'importation de Api_itemService
import { Api_itemService } from '../services/api/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import { Api_eventService } from '../services/api/api_event.service';

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
      title: 'Soutenir',
      description:
        'Rejoignez notre communauté engagée avec une donation ou un abonnement mensuel. Ensemble, nous faisons la différence !',
      iconSrc: '../../assets/icons/community.svg',
      routerLink: '/payment', // Modifié de '/community' à '/payment'
    },
    {
      title: 'Vitrine',
      description:
        "Découvrez notre sélection d'articles recyclés uniques à prix abordables pour un style éco-responsable.",
      iconSrc: '../../assets/icons/shop.svg',
      routerLink: '/product-list',
    },
  ];

  constructor(
    private itemService: Api_itemService,
    private sanitizer: DomSanitizer,
    private eventService: Api_eventService
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

  // Méthode pour charger les événements à venir, avec filtrage pour le mois actuel et non passés
  loadUpcomingEvents(): void {
    this.eventLoading = true;
    this.eventError = null;
    this.eventService.getUpcomingEvents().subscribe({
      next: (events: any[]) => {
        this.upcomingEvents = events;
        this.eventLoading = false;
      },
      error: (err: unknown) => {
        this.eventError = 'Erreur lors du chargement des événements à venir.';
        this.eventLoading = false;
        console.error('Erreur:', err);
      },
    });
  }

  // Méthode pour formater la date des événements avec l'heure
  formatEventDate(date: string | Date): string {
    const eventDate = new Date(date);

    // Format pour la date (jour, mois, année)
    const dateFormatted = eventDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Format pour l'heure (heures:minutes)
    const timeFormatted = eventDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Retourner date et heure
    return `${dateFormatted} à ${timeFormatted}`;
  }
}
