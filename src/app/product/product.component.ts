import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  item: ItemWithCategories | null = null;
  loading = true;
  error: string | null = null;
  itemId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private itemService: Api_itemService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.itemId = params.get('id');
      if (this.itemId) {
        this.loadItemDetails(this.itemId);
      } else {
        this.error = 'Item ID not found';
        this.loading = false;
      }
    });
  }

  loadItemDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.itemService.getItemById(id).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        // Extract the ItemWithCategories from the response object
        this.item = response.data;
        this.loading = false;
        console.log('Loaded item data:', this.item);
      },
      error: (err) => {
        this.error = 'Failed to load item details. Please try again later.';
        this.loading = false;
        console.error('Error loading item:', err);
      },
    });
  }

  // Helper method to get image URL
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/placeholder.png';

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
    // Use Location service to navigate back to the previous page
    this.location.back();
  }
}
