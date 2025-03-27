import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import { ProductCardComponent } from './product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
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

    this.itemService.getItemByStatus(0).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.items = response;
        } else {
          const responseObj = response as any;

          if (responseObj.data) {
            this.items = Array.isArray(responseObj.data)
              ? responseObj.data
              : [responseObj.data];
          } else {
            this.items = [];
            console.warn('Could not extract items from response', responseObj);
          }
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
