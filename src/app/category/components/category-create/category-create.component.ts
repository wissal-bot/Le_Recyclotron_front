import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Api_categoryService } from '../../../services/api/api_category.service';
import { CategoryWithChildren } from '../../../../interfaces/category.interface';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css'],
})
export class CategoryCreateComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;
  categories: CategoryWithChildren[] = [];
  parentOptions: CategoryWithChildren[] = [];
  flatCategories: Array<CategoryWithChildren & { level: number }> = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: Api_categoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      parentId: [''],
    });
  }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        // Mise à jour pour utiliser toutes les catégories comme options de parent
        this.flatCategories = this.getAllCategoriesFlat();
        this.parentOptions = this.categories;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des catégories';
      },
    });
  }

  /**
   * Retourne toutes les catégories (racines et enfants) à plat, avec un champ 'level' pour l'indentation visuelle.
   */
  getAllCategoriesFlat(): Array<CategoryWithChildren & { level: number }> {
    const flat: Array<CategoryWithChildren & { level: number }> = [];
    const visit = (cat: CategoryWithChildren, level: number) => {
      flat.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child) =>
          visit(child as CategoryWithChildren, level + 1)
        );
      }
    };
    this.categories.forEach((cat) => {
      // On ne prend que les racines (pas de parentId)
      if (!cat.parentId) visit(cat, 0);
    });
    return flat;
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
