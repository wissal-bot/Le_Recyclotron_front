import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import { InputItem } from '../../../../interfaces/item.interface';
import {
  ItemStatus,
  getAllItemStatuses,
} from '../../../../interfaces/item-status.enum';

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-create.component.html',
  styleUrls: ['./item-create.component.css'],
})
export class ItemCreateComponent {
  itemForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  submitSuccess: boolean = false; // Status options for the dropdown limited to SALABLE and UNSALABLE only
  statusOptions = [
    { value: ItemStatus.SALABLE, label: 'Salable' },
    { value: ItemStatus.UNSALABLE, label: 'Unsalable' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private itemService: Api_itemService
  ) {
    // Initialize form with default values
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      material: ['', [Validators.required]],
      status: [ItemStatus.SALABLE, [Validators.required]],
      image: ['assets/placeholder.png', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched(this.itemForm);
      return;
    }

    this.loading = true;
    this.error = null; // Get form values and ensure proper formatting
    const formValues = this.itemForm.value;

    // Create item data with proper type conversion for status
    const itemData: InputItem = {
      name: formValues.name,
      material: formValues.material,
      status: Number(formValues.status), // Ensure status is a number
      image: formValues.image,
    };

    console.log('Submitting item data:', itemData);
    console.log('Status value type:', typeof itemData.status);

    this.itemService.createItem(itemData).subscribe({
      next: (response) => {
        console.log('Successfully created item:', response);
        this.submitSuccess = true;
        this.loading = false;
        // Redirect immediately to items screen
        this.router.navigate(['/items']);
      },
      error: (err) => {
        console.error('Error creating item', err);
        if (err.error && err.error.message) {
          this.error = `Failed to create item: ${err.error.message}`;
        } else {
          this.error = 'Failed to create item. Please try again.';
        }
        this.loading = false;
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
    this.router.navigate(['/items']);
  }
}
