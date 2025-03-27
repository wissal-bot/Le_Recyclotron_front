import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemWithCategories } from '../../../interfaces/item.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() item!: ItemWithCategories;

  getImageUrl(item: any): string {
    if (!item || !item.imageUrl) return 'assets/placeholder.png';

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
}
