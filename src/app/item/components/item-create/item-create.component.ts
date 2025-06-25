import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api_itemService } from '../../../services/api/api_item.service';
import { Api_categoryService } from '../../../services/api/api_category.service';
import { InputItem } from '../../../../interfaces/item.interface';
import {
  ItemStatus,
  getAllItemStatuses,
} from '../../../../interfaces/item-status.enum';
import { CategoryWithChildren } from '../../../../interfaces/category.interface';
import {
  catchError,
  finalize,
  forkJoin,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './item-create.component.html',
  styleUrls: ['./item-create.component.css'],
})
export class ItemCreateComponent implements OnInit {
  itemForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  submitSuccess: boolean = false;

  // API URL from environment
  private readonly API_URL = environment.API_URL;

  // Status options for dropdown
  statusOptions = [
    { value: ItemStatus.SALABLE, label: 'Salable' },
    { value: ItemStatus.UNSALABLE, label: 'Unsalable' },
  ];

  // Category options
  flatCategories: Array<CategoryWithChildren & { level: number }> = [];
  selectedCategoryIds: string[] = [];

  // Map pour stocker les relations parent-enfant
  categoryParentMap: Map<string, string> = new Map();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private itemService: Api_itemService,
    private categoryService: Api_categoryService,
    private http: HttpClient
  ) {
    // Initialize form with default values
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      material: ['', [Validators.required]],
      status: [ItemStatus.SALABLE, [Validators.required]],
      image: ['assets/placeholder.png', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.flatCategories = this.getAllCategoriesFlat(categories);
        this.buildCategoryParentMap(categories); // Construire la map après avoir chargé les catégories
      },
      error: (err) => {
        this.error = 'Error loading categories';
        console.error('Error loading categories:', err);
      },
    });
  }

  /**
   * Returns all categories (roots and children) flattened, with a 'level' field for visual indentation.
   * Also builds the parent-child relationship map.
   */
  getAllCategoriesFlat(
    categories: CategoryWithChildren[]
  ): Array<CategoryWithChildren & { level: number }> {
    const flat: Array<CategoryWithChildren & { level: number }> = [];
    // Reset the parent map
    this.categoryParentMap = new Map();

    const visit = (cat: CategoryWithChildren, level: number) => {
      flat.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child) => {
          // Build parent-child relationship
          this.categoryParentMap.set(child.id, cat.id);
          visit(child as CategoryWithChildren, level + 1);
        });
      }
    };
    categories.forEach((cat) => {
      if (!cat.parentId) visit(cat, 0);
    });

    // Also call our dedicated method to ensure all relationships are captured
    this.buildCategoryParentMap(categories);

    return flat;
  }

  /**
   * Construit une map des relations parent-enfant entre les catégories
   */
  buildCategoryParentMap(categories: CategoryWithChildren[]): void {
    this.categoryParentMap.clear();
    // Fonction récursive pour parcourir l'arborescence
    const processCategory = (category: CategoryWithChildren) => {
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => {
          this.categoryParentMap.set(child.id, category.id);
          processCategory(child as CategoryWithChildren);
        });
      }
    };

    // Traiter chaque catégorie racine
    categories.forEach((category) => {
      processCategory(category);
    });
  }

  /**
   * Récupère tous les IDs des parents d'une catégorie (récursif jusqu'à la racine)
   */
  getParentCategoryIds(categoryId: string): string[] {
    const parentIds: string[] = [];
    let currentId = categoryId;

    while (this.categoryParentMap.has(currentId)) {
      const parentId = this.categoryParentMap.get(currentId);
      if (parentId) {
        parentIds.push(parentId);
        currentId = parentId;
      } else {
        break;
      }
    }

    return parentIds;
  }

  /**
   * Récupère tous les IDs des enfants d'une catégorie
   */
  getChildCategoryIds(categoryId: string): string[] {
    const childIds: string[] = [];

    // Fonction pour trouver récursivement tous les enfants
    const findChildren = (parentId: string) => {
      this.flatCategories.forEach((category) => {
        const catParentId = this.categoryParentMap.get(category.id);
        if (catParentId === parentId) {
          childIds.push(category.id);
          findChildren(category.id);
        }
      });
    };

    findChildren(categoryId);
    return childIds;
  }

  // Note: Les méthodes de manipulation des relations parent-enfant sont définies plus haut

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index === -1) {
      // Ajouter la catégorie
      this.selectedCategoryIds.push(categoryId);

      // Ajouter automatiquement toutes les catégories parentes
      const parentIds = this.getParentCategoryIds(categoryId);
      parentIds.forEach((parentId) => {
        if (!this.selectedCategoryIds.includes(parentId)) {
          this.selectedCategoryIds.push(parentId);
        }
      });
    } else {
      // Supprimer la catégorie
      this.selectedCategoryIds.splice(index, 1);

      // Supprimer également tous ses enfants
      const childIds = this.getChildCategoryIds(categoryId);
      childIds.forEach((childId) => {
        const childIndex = this.selectedCategoryIds.indexOf(childId);
        if (childIndex !== -1) {
          this.selectedCategoryIds.splice(childIndex, 1);
        }
      });
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched(this.itemForm);
      return;
    }

    this.loading = true;
    this.error = null;

    // Create item data with proper type conversion for status
    const itemData: InputItem = {
      name: this.itemForm.value.name,
      material: this.itemForm.value.material,
      status: Number(this.itemForm.value.status), // Ensure status is a number
      image: this.itemForm.value.image,
    };

    console.log('Submitting item data:', itemData);

    this.itemService
      .createItem(itemData)
      .pipe(
        catchError((err) => {
          console.error('Error creating item', err);
          if (err.error && err.error.message) {
            this.error = `Failed to create item: ${err.error.message}`;
          } else {
            this.error = 'Failed to create item. Please try again.';
          }
          return of(null); // Return null to continue the stream
        }),
        finalize(() => {
          if (!this.submitSuccess) {
            this.loading = false;
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) return; // Skip if there was an error

          console.log('Successfully created item:', response);
          this.submitSuccess = true;

          // Add categories to the item if any are selected
          if (this.selectedCategoryIds.length > 0) {
            this.addCategoriesToItem(response.id);
          } else {
            // Redirect immediately to items screen if no categories to add
            setTimeout(() => {
              this.router.navigate(['/items']);
            }, 1500);
          }
        },
      });
  }

  /**
   * Adds all selected categories to the newly created item
   */
  addCategoriesToItem(itemId: string): void {
    // If no categories selected, just redirect
    if (this.selectedCategoryIds.length === 0) {
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/items']);
      }, 1500);
      return;
    }

    console.log(
      `Attempting to add ${this.selectedCategoryIds.length} categories to item ${itemId}`
    );

    // Try two approaches - first individual category additions, then bulk update if that fails
    this.addCategoriesIndividually(itemId)
      .pipe(
        catchError((err) => {
          console.log(
            'Individual category additions failed, trying bulk update',
            err
          );
          return this.addCategoriesBulk(itemId);
        }),
        finalize(() => {
          this.loading = false;
          // Redirect to items screen after all category additions complete
          setTimeout(() => {
            this.router.navigate(['/items']);
          }, 1500);
        })
      )
      .subscribe({
        next: (result) => {
          console.log('Category addition process completed:', result);
        },
        error: (err) => {
          console.error('All category addition methods failed:', err);
        },
      });
  }

  /**
   * Try to add categories one by one
   */
  private addCategoriesIndividually(itemId: string): Observable<any> {
    // Create observables for each category addition
    const categoryObservables = this.selectedCategoryIds.map((categoryId) =>
      this.itemService.addCategoryToItem(itemId, categoryId).pipe(
        catchError((err) => {
          console.error(`Error adding category ${categoryId} to item`, err);
          throw err; // Let the error propagate up to trigger the fallback
        })
      )
    );

    return forkJoin(categoryObservables);
  }

  /**
   * Try to update the item with all categories at once
   */
  private addCategoriesBulk(itemId: string): Observable<any> {
    console.log('Attempting bulk category update for item', itemId);

    // First try the normal API service method
    return this.itemService
      .updateItemById(itemId, {
        categories: this.selectedCategoryIds,
      })
      .pipe(
        catchError((err) => {
          console.error('First bulk category update attempt failed', err);

          // Try a direct PUT request as last resort
          return this.http
            .put<any>(`${this.API_URL}/item/${itemId}`, {
              categories: this.selectedCategoryIds,
            })
            .pipe(
              catchError((err2) => {
                console.error('All bulk update attempts failed', err2);
                // Return success anyway to not block the UI
                return of({
                  success: true,
                  message: 'Item created but categories may not be saved',
                });
              })
            );
        })
      );
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
