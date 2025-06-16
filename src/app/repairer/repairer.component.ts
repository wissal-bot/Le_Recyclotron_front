import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api_itemService } from '../services/api/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import {
  ItemStatus,
  getItemStatusLabel,
} from '../../interfaces/item-status.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repairer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repairer.component.html',
  styleUrls: ['./repairer.component.css'],
})
export class RepairerComponent implements OnInit {
  // Make ItemStatus accessible from the template
  ItemStatus = ItemStatus;

  // Tab state
  activeTab: 'sort' | 'repair' = 'sort';

  // Items lists
  unsalableItems: ItemWithCategories[] = [];
  reparableItems: ItemWithCategories[] = [];
  selectedItem: ItemWithCategories | null = null;

  // Loading states
  loadingSortItems: boolean = true;
  loadingRepairItems: boolean = true;
  sortItemsError: string | null = null;
  repairItemsError: string | null = null;

  constructor(private itemService: Api_itemService, private router: Router) {}

  ngOnInit(): void {
    this.loadUnsalableItems();
    this.loadReparableItems();
  }

  // Tab navigation
  setActiveTab(tab: 'sort' | 'repair'): void {
    this.activeTab = tab;
  }
  // Load items by status
  loadUnsalableItems(): void {
    this.loadingSortItems = true;
    this.sortItemsError = null;

    console.log('Loading unsalable items with status:', ItemStatus.UNSALABLE);

    this.itemService.getItemByStatus(ItemStatus.UNSALABLE).subscribe({
      next: (items) => {
        console.log('Unsalable items loaded:', items);

        if (items && items.length === 0) {
          console.log('No unsalable items returned from API');

          // Fallback: try to get all items and filter manually
          this.loadUnsalableItemsFallback();
        } else {
          this.unsalableItems = items;
          this.loadingSortItems = false;
        }
      },
      error: (error) => {
        console.error('Error loading unsalable items:', error);
        this.sortItemsError = 'Failed to load items. Please try again.';
        this.loadingSortItems = false;

        // Try fallback method on error only if it's an API issue
        if (error.status && (error.status >= 400 || error.status === 0)) {
          this.loadUnsalableItemsFallback();
        }
      },
    });
  }
  // Fallback method to load unsalable items
  loadUnsalableItemsFallback(): void {
    console.log('Using fallback method to load unsalable items');

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        // Filter for UNSALABLE items only
        this.unsalableItems = items.filter(
          (item) => Number(item.status) === ItemStatus.UNSALABLE
        );

        console.log('Filtered unsalable items:', this.unsalableItems);
        this.loadingSortItems = false;

        if (this.unsalableItems.length === 0) {
          console.log('No unsalable items found after filtering');
          this.sortItemsError = 'No items to sort found.';
        }
      },
      error: (err) => {
        console.error('Error in fallback loading:', err);
        this.sortItemsError = 'Failed to load items. Please try again.';
        this.loadingSortItems = false;
      },
    });
  }
  loadReparableItems(): void {
    this.loadingRepairItems = true;
    this.repairItemsError = null;

    console.log('Loading reparable items with status:', ItemStatus.REPARABLE);

    this.itemService.getItemByStatus(ItemStatus.REPARABLE).subscribe({
      next: (items) => {
        console.log('Reparable items loaded:', items);

        if (items && items.length === 0) {
          console.log('No reparable items returned from API');

          // Fallback: try to get all items and filter manually
          this.loadReparableItemsFallback();
        } else {
          this.reparableItems = items;
          this.loadingRepairItems = false;
        }
      },
      error: (error) => {
        console.error('Error loading reparable items:', error);
        this.repairItemsError = 'Failed to load items. Please try again.';
        this.loadingRepairItems = false;

        // Try fallback method on error only if it's an API issue
        if (error.status && (error.status >= 400 || error.status === 0)) {
          this.loadReparableItemsFallback();
        }
      },
    });
  }
  // Fallback method to load reparable items
  loadReparableItemsFallback(): void {
    console.log('Using fallback method to load reparable items');

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        // Filter for REPARABLE items only
        this.reparableItems = items.filter(
          (item) => Number(item.status) === ItemStatus.REPARABLE
        );

        console.log('Filtered reparable items:', this.reparableItems);
        this.loadingRepairItems = false;

        if (this.reparableItems.length === 0) {
          console.log('No reparable items found after filtering');
          this.repairItemsError = 'No items to repair found.';
        }
      },
      error: (err) => {
        console.error('Error in fallback loading:', err);
        this.repairItemsError = 'Failed to load items. Please try again.';
        this.loadingRepairItems = false;
      },
    });
  }

  // Item actions
  viewItemDetails(item: ItemWithCategories): void {
    this.selectedItem = item;
  }

  closeItemDetails(): void {
    this.selectedItem = null;
  }
  markAsReparable(item: ItemWithCategories): void {
    console.log(
      `Marking item ${item.id} as REPARABLE (${ItemStatus.REPARABLE})`
    );
    const updatedData = { status: ItemStatus.REPARABLE };

    this.itemService.updateItemById(item.id, updatedData).subscribe({
      next: (updatedItem) => {
        console.log('Item marked as reparable:', updatedItem);
        // Remove from unsalable list
        this.unsalableItems = this.unsalableItems.filter(
          (i) => i.id !== item.id
        );
        // Refresh reparable items
        this.loadReparableItems();
      },
      error: (error) => {
        console.error('Error updating item status:', error);
        alert('Failed to update item status. Please try again.');
      },
    });
  }
  markAsMaterial(item: ItemWithCategories): void {
    console.log(`Marking item ${item.id} as MATERIAL (${ItemStatus.MATERIAL})`);
    const updatedData = { status: ItemStatus.MATERIAL };

    this.itemService.updateItemById(item.id, updatedData).subscribe({
      next: (updatedItem) => {
        console.log('Item marked as material:', updatedItem);
        // Remove from unsalable list
        this.unsalableItems = this.unsalableItems.filter(
          (i) => i.id !== item.id
        );
      },
      error: (error) => {
        console.error('Error updating item status:', error);
        alert('Failed to update item status. Please try again.');
      },
    });
  }
  markAsRepaired(item: ItemWithCategories): void {
    console.log(`Marking item ${item.id} as SALABLE (${ItemStatus.SALABLE})`);
    const updatedData = { status: ItemStatus.SALABLE };

    this.itemService.updateItemById(item.id, updatedData).subscribe({
      next: (updatedItem) => {
        console.log('Item marked as repaired (salable):', updatedItem);
        // Remove from reparable list
        this.reparableItems = this.reparableItems.filter(
          (i) => i.id !== item.id
        );
      },
      error: (error) => {
        console.error('Error updating item status:', error);
        alert('Failed to update item status. Please try again.');
      },
    });
  }
  // Helper method to get status label
  getItemStatusLabel(status: ItemStatus | number): string {
    return getItemStatusLabel(status);
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = '/assets/placeholder.png';
    }
  }
}
