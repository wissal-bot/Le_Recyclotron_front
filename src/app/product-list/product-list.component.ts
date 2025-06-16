import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api_itemService } from '../services/api/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import { ProductCardComponent } from './product-card/product-card.component';
import { ItemStatus } from '../../interfaces/item-status.enum';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  items: ItemWithCategories[] = [];
  loading = true;
  error: string | null = null;

  constructor(private itemService: Api_itemService) {}

  ngOnInit(): void {
    this.loadSalableItems();
  }

  loadSalableItems(): void {
    this.loading = true;
    this.error = null;

    // Explicitly pass SALABLE status to ensure we only get salable items
    this.itemService.getItemByStatus(ItemStatus.SALABLE).subscribe({
      next: (response) => {
        console.log('Raw response from getItemByStatus:', response);

        if (Array.isArray(response)) {
          // Filter again to ensure only SALABLE items
          this.items = response.filter(
            (item) => Number(item.status) === ItemStatus.SALABLE
          );
        } else {
          const responseObj = response as any;

          if (responseObj.data) {
            // Get items from data property if available
            const itemsData = Array.isArray(responseObj.data)
              ? responseObj.data
              : [responseObj.data]; // Filter for SALABLE items only
            this.items = itemsData.filter(
              (item: ItemWithCategories) =>
                Number(item.status) === ItemStatus.SALABLE
            );
          } else {
            this.items = [];
            console.warn('Could not extract items from response', responseObj);
          }
        }

        this.loading = false;
        console.log('Loaded SALABLE items:', this.items);

        // If no items were found, try using the getAllItems as fallback
        if (this.items.length === 0) {
          this.loadAllItemsAsFallback();
        }
      },
      error: (err) => {
        console.error('Error loading items by status:', err);
        this.loadAllItemsAsFallback();
      },
    });
  }

  // Fallback method to load all items and filter for SALABLE ones
  loadAllItemsAsFallback(): void {
    console.log('Using fallback method to load all items and filter');

    this.itemService.getAllItemsWithFallback().subscribe({
      next: (items) => {
        console.log('All items loaded:', items); // Filter for only SALABLE items
        this.items = items.filter(
          (item: ItemWithCategories) =>
            Number(item.status) === ItemStatus.SALABLE
        );
        console.log('Filtered SALABLE items:', this.items);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load items. Please try again later.';
        this.loading = false;
        console.error('Error in fallback loading:', err);
      },
    });
  }

  getImageUrl(item: any): string {
    if (!item || !item.imageUrl) return 'assets/placeholder.png';

    try {
      new URL(item.imageUrl);
      return item.imageUrl;
    } catch (e) {
      if (item.imageUrl.startsWith('/')) {
        return item.imageUrl;
      } else {
        return `assets/${item.imageUrl}`;
      }
    }
  }
}
