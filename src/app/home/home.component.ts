import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';

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

  constructor(
    private itemService: Api_itemService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadSalableItems();
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
}
