import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import { ItemWithCategories } from '../../../../interfaces/item.interface';
import {
  ItemStatus,
  getItemStatusLabel,
} from '../../../../interfaces/item-status.enum';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items: ItemWithCategories[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private itemService: Api_itemService, private router: Router) {}
  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;

    console.log('Fetching items from API...');

    this.itemService
      .getAllItems()
      .pipe(
        tap((items) => console.log('API returned items:', items)),
        catchError((err) => {
          console.error('Error fetching items from API:', err);
          this.error = 'Failed to load items. Please try again later.';
          return of([]);
        })
      )
      .subscribe({
        next: (responseData: any) => {
          console.log('Response received:', responseData);
          console.log('Type of response:', typeof responseData);
          console.log('Is array:', Array.isArray(responseData));

          let itemsArray: ItemWithCategories[] = [];

          // Handle different response formats
          if (responseData) {
            if (Array.isArray(responseData)) {
              // Response is already an array
              itemsArray = responseData;
            } else if (typeof responseData === 'object') {
              // Response is an object, check for common patterns
              if (responseData.data && Array.isArray(responseData.data)) {
                // API returns { data: [...items] }
                itemsArray = responseData.data;
              } else if (
                responseData.items &&
                Array.isArray(responseData.items)
              ) {
                // API returns { items: [...items] }
                itemsArray = responseData.items;
              } else {
                // Try to convert object to array if possible
                console.warn(
                  'Unexpected response format, attempting to extract items'
                );
                const extractedItems = Object.values(responseData).filter(
                  (val) => typeof val === 'object' && val !== null
                ) as any[];

                // Check if these objects match our expected item structure
                itemsArray = extractedItems.filter(
                  (item) =>
                    item.id && item.name && typeof item.name === 'string'
                ) as ItemWithCategories[];
              }
            }
          }

          this.items = itemsArray;
          this.loading = false;

          if (this.items.length === 0) {
            console.warn('No items found in the response');
            this.error = 'No items found.';
          } else {
            console.log('Successfully loaded', this.items.length, 'items');
          }
        },
        error: (err) => {
          console.error('Error loading items:', err);
          this.error = 'Failed to load items. Please try again later.';
          this.loading = false;
        },
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/items/create']);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/items/detail', id]);
  }

  reloadItems(): void {
    console.log('Reloading items...');
    this.loadItems();
  }

  // Exposer l'énumération au template
  itemStatus = ItemStatus;

  getStatusLabel(status: ItemStatus | number | undefined): string {
    if (status === undefined || status === null) {
      return 'Unknown';
    }
    return getItemStatusLabel(status);
  }
}
