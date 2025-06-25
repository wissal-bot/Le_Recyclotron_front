import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Api_itemService } from '../../../services/api/api_item.service';
import { Api_categoryService } from '../../../services/api/api_category.service';
import {
  ItemWithCategories,
  PartialItem,
} from '../../../../interfaces/item.interface';
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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './item-update.component.html',
  styleUrls: ['./item-update.component.css'],
})
export class ItemUpdateComponent implements OnInit {
  itemId: string = '';
  itemForm: FormGroup;
  loading: boolean = true;
  updating: boolean = false;
  error: string | null = null;
  submitSuccess: boolean = false;
  categoryWarning: boolean = false; // Flag pour indiquer des problèmes avec les catégories

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
  initialCategoryIds: string[] = []; // To track which categories were initially assigned

  // Map pour stocker les relations parent-enfant
  categoryParentMap: Map<string, string> = new Map();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private itemService: Api_itemService,
    private categoryService: Api_categoryService,
    private http: HttpClient
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      material: ['', [Validators.required]],
      status: ['', [Validators.required]],
      image: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Get item ID from route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.itemId = id;
        this.loadItemAndCategories();
      } else {
        this.error = 'Invalid item ID';
        this.loading = false;
      }
    });
  }

  loadItemAndCategories(): void {
    this.loading = true;
    this.error = null;

    // Create parallel observables for better performance and error handling
    const categoriesObs = this.categoryService.getAllCategories().pipe(
      catchError((err) => {
        console.error('Error loading available categories:', err);
        return of([]);
      })
    );

    const itemObs = this.itemService.getItemById(this.itemId).pipe(
      catchError((err) => {
        console.error('Error loading item details:', err);
        this.error = 'Failed to load item details. Please try again.';
        return of(null);
      })
    );

    // First load both categories and item details in parallel
    forkJoin({
      categories: categoriesObs,
      item: itemObs,
    })
      .pipe(
        switchMap((result) => {
          // Process available categories
          if (result.categories && result.categories.length > 0) {
            this.flatCategories = this.getAllCategoriesFlat(result.categories);
            this.buildCategoryParentMap(result.categories); // Build the parent-child map
          }

          // If item failed to load, stop here
          if (!result.item) {
            throw new Error('Failed to load item');
          }

          // Update form with item data
          this.itemForm.patchValue({
            name: result.item.name,
            material: result.item.material,
            status: result.item.status,
            image: result.item.image,
          });

          // Extract categories from item if they exist
          if (
            result.item.categories &&
            Array.isArray(result.item.categories) &&
            result.item.categories.length > 0
          ) {
            this.selectedCategoryIds = result.item.categories.map(
              (cat) => cat.id
            );
            this.initialCategoryIds = [...this.selectedCategoryIds];
            return of([]); // Skip loading categories separately
          }

          // Otherwise, try to load categories for this item
          return this.itemService.getItemCategories(this.itemId);
        }),
        catchError((err) => {
          console.error('Error in loading sequence:', err);
          if (!this.error) {
            // Only set if not already set
            this.error =
              'Failed to load item data. Some features may be limited.';
          }
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (categories) => {
          if (categories && categories.length > 0) {
            // Store the IDs of categories assigned to this item (if not already set)
            if (this.selectedCategoryIds.length === 0) {
              this.selectedCategoryIds = categories.map((cat) => cat.id);
              this.initialCategoryIds = [...this.selectedCategoryIds];
            }
          }
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

  // Map des relations parent-enfant construit à partir des catégories disponibles
  private categoryParentMapBuilt: boolean = false;

  /**
   * Construit une map des relations parent-enfant entre les catégories
   */
  buildCategoryParentMap(categories: CategoryWithChildren[]): void {
    this.categoryParentMap.clear(); // Réinitialiser la map existante

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
      if (!category.parentId) processCategory(category);
    });

    this.categoryParentMapBuilt = true;
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
    this.updating = true;
    this.error = null;

    const itemData: PartialItem = {
      name: this.itemForm.value.name,
      material: this.itemForm.value.material,
      status: Number(this.itemForm.value.status),
      image: this.itemForm.value.image,
    };

    this.itemService
      .updateItemById(this.itemId, itemData)
      .pipe(
        switchMap(() => this.processCategoryChanges()),
        catchError((err) => {
          console.error('Error updating item:', err);
          this.error = 'Failed to update item. Please try again.';
          return of(null); // Return a null observable to continue the stream
        }),
        finalize(() => {
          this.updating = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.submitSuccess = true;

          // Si le résultat contient un message d'avertissement sur les catégories
          if (
            result === null ||
            (result && typeof result === 'object' && result.categoryWarning)
          ) {
            this.categoryWarning = true;
          }

          // Navigate after a short delay to show success message
          setTimeout(() => {
            this.router.navigate(['/items']);
          }, 1500);
        },
      });
  }

  /**
   * Process category additions and removals based on the difference
   * between initial categories and currently selected categories
   */
  processCategoryChanges() {
    console.log('Processing category changes...');
    console.log('Initial categories:', this.initialCategoryIds);
    console.log('Selected categories:', this.selectedCategoryIds);

    // Find categories to add (in selected but not in initial)
    const categoriesToAdd = this.selectedCategoryIds.filter(
      (id) => !this.initialCategoryIds.includes(id)
    );

    // Find categories to remove (in initial but not in selected)
    const categoriesToRemove = this.initialCategoryIds.filter(
      (id) => !this.selectedCategoryIds.includes(id)
    );

    console.log('Categories to add:', categoriesToAdd);
    console.log('Categories to remove:', categoriesToRemove);

    const totalChanges = categoriesToAdd.length + categoriesToRemove.length;
    if (totalChanges === 0) {
      console.log('No category changes to process');
      return of(null); // No changes to process
    }

    // Two approaches - try individual updates first, then fallback to bulk update
    return this.processIndividualCategoryChanges(
      categoriesToAdd,
      categoriesToRemove
    ).pipe(
      catchError((err) => {
        console.log(
          'Individual category updates failed, trying bulk update',
          err
        );
        return this.processBulkCategoryUpdate();
      })
    );
  }

  /**
   * Process category changes one by one
   */
  private processIndividualCategoryChanges(
    categoriesToAdd: string[],
    categoriesToRemove: string[]
  ) {
    // Create observables for each category addition
    const addObservables = categoriesToAdd.map((categoryId) =>
      this.itemService.addCategoryToItem(this.itemId, categoryId).pipe(
        catchError((err) => {
          console.error(`Error adding category ${categoryId} to item`, err);
          // Throw to trigger the main fallback
          throw err;
        })
      )
    );

    // Create observables for each category removal
    const removeObservables = categoriesToRemove.map((categoryId) =>
      this.itemService.removeCategoryFromItem(this.itemId, categoryId).pipe(
        catchError((err) => {
          console.error(`Error removing category ${categoryId} from item`, err);
          // Throw to trigger the main fallback
          throw err;
        })
      )
    );

    // Combine all observables and wait for all to complete
    return forkJoin([...addObservables, ...removeObservables]).pipe(
      switchMap((results: any[]) => {
        console.log(
          'All individual category operations completed successfully'
        );
        return of({ success: true });
      })
    );
  }

  /**
   * Fallback approach: update the entire item with all selected categories at once
   */
  private processBulkCategoryUpdate() {
    console.log('Attempting bulk category update');
    // Update the item with all currently selected category IDs
    const update = { categories: this.selectedCategoryIds };

    return this.http
      .put<any>(`${this.API_URL}/item/${this.itemId}`, update)
      .pipe(
        catchError((err) => {
          console.error('Bulk category update also failed', err);
          // Return success with warning flag to not block the UI - the item data is saved
          return of({ success: true, categoryWarning: true });
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
