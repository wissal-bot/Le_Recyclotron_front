import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import { ItemWithCategories } from '../../../../interfaces/item.interface';

@Component({
  selector: 'app-item-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-delete.component.html',
  styleUrls: ['./item-delete.component.css'],
})
export class ItemDeleteComponent implements OnInit {
  item: ItemWithCategories | null = null;
  itemId: string = '';
  loading: boolean = true;
  deleting: boolean = false;
  error: string | null = null;
  deleteSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: Api_itemService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid item ID';
      this.loading = false;
      return;
    }

    this.itemId = id;
    this.loadItem();
  }

  loadItem(): void {
    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading item details', err);
        this.error = 'Failed to load item details. Please try again later.';
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    this.deleting = true;

    this.itemService.deleteItemById(this.itemId).subscribe({
      next: () => {
        this.deleteSuccess = true;
        this.deleting = false;
        // Redirect immediately to items screen
        this.router.navigate(['/items']);
      },
      error: (err) => {
        console.error('Error deleting item', err);
        this.error = 'Failed to delete item. Please try again.';
        this.deleting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/items/detail', this.itemId]);
  }
}
