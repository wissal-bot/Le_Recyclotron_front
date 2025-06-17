import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Api_categoryService } from '../../../services/api/api_category.service';

@Component({
  selector: 'app-category-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './category-update.component.html',
  styleUrls: ['./category-update.component.css'],
})
export class CategoryUpdateComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;
  categoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: Api_categoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      parentId: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = params.get('id');
      if (this.categoryId) {
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (cat) => {
            this.categoryForm.patchValue(cat);
          },
          error: () => {
            this.error = 'Erreur lors du chargement de la catégorie';
          },
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.categoryId || this.categoryForm.invalid) return;
    this.loading = true;
    this.categoryService
      .updateCategory(this.categoryId, this.categoryForm.value)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur lors de la mise à jour';
          this.loading = false;
        },
      });
  }
}
