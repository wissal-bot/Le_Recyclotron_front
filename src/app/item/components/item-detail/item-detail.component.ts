import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import { ItemWithCategories } from '../../../../interfaces/item.interface';
import {
  ItemStatus,
  getItemStatusLabel,
} from '../../../../interfaces/item-status.enum';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
})
export class ItemDetailComponent implements OnInit {
  item: ItemWithCategories | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: Api_itemService
  ) {}

  ngOnInit(): void {
    this.loadItem();
  }
  loadItem(): void {
    this.loading = true;
    this.error = null;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid item ID';
      this.loading = false;
      return;
    }

    console.log(`Loading item details for ID: ${id}`);

    this.itemService.getItemById(id).subscribe({
      next: (item) => {
        console.log('Item details loaded successfully:', item);
        this.item = item;
        this.loading = false;

        if (!this.item.name || this.item.name === 'Unknown Item') {
          console.warn('Item data might be incomplete');
        }
      },
      error: (err) => {
        console.error('Error loading item details', err);
        this.error = 'Failed to load item details. Please try again later.';
        this.loading = false;
      },
    });
  }

  reloadItem(): void {
    console.log('Reloading item details...');
    this.loadItem();
  }

  navigateToUpdate(): void {
    if (this.item) {
      this.router.navigate(['/items/update', this.item.id]);
    }
  }

  navigateToDelete(): void {
    if (this.item) {
      this.router.navigate(['/items/delete', this.item.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/items']);
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
