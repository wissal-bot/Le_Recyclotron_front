import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Api_categoryService } from '../../../services/api/api_category.service';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css'],
})
export class CategoryCreateComponent {
  categoryForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: Api_categoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      parentId: [''],
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
    this.loading = true;
    this.categoryService.createCategory(this.categoryForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.categoryForm.reset();
      },
      error: () => {
        this.error = 'Erreur lors de la création de la catégorie';
        this.loading = false;
      },
    });
  }
}
