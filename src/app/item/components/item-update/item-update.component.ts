import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import {
  ItemWithCategories,
  PartialItem,
} from '../../../../interfaces/item.interface';
import {
  ItemStatus,
  getAllItemStatuses,
} from '../../../../interfaces/item-status.enum';

@Component({
  selector: 'app-item-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-update.component.html',
  styleUrls: ['./item-update.component.css'],
})
export class ItemUpdateComponent implements OnInit {
  itemId: string = '';
  itemForm: FormGroup;
  loading: boolean = true;
  updating: boolean = false;
  error: string | null = null;
  submitSuccess: boolean = false; // Status options for the dropdown limited to SALABLE and UNSALABLE only
  statusOptions = [
    { value: ItemStatus.SALABLE, label: 'Salable' },
    { value: ItemStatus.UNSALABLE, label: 'Unsalable' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private itemService: Api_itemService
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      material: ['', [Validators.required]],
      status: ['', [Validators.required]],
      image: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid item ID';
      this.loading = false;
      return;
    }

    this.itemId = id;
    this.loadItemDetails();
  }

  loadItemDetails(): void {
    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.populateForm(item);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading item details', err);
        this.error = 'Failed to load item details. Please try again later.';
        this.loading = false;
      },
    });
  }
  populateForm(item: ItemWithCategories): void {
    this.itemForm.patchValue({
      name: item.name,
      material: item.material,
      status: item.status,
      image: item.image,
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched(this.itemForm);
      return;
    }
    this.updating = true;
    this.error = null;

    const itemData: PartialItem = {
      ...this.itemForm.value,
      // Ensure status is a number
      status: Number(this.itemForm.value.status),
    };

    console.log('Updating item data:', itemData);

    this.itemService.updateItemById(this.itemId, itemData).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.updating = false;
        // Redirect immediately to items screen
        this.router.navigate(['/items']);
      },
      error: (err) => {
        console.error('Error updating item', err);
        this.error = 'Failed to update item. Please try again.';
        this.updating = false;
      },
    });
  }

  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/items/detail', this.itemId]);
  }
}
