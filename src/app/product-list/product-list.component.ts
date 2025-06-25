import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api_itemService } from '../services/api/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';
import { ProductCardComponent } from './product-card/product-card.component';
import { ItemStatus } from '../../interfaces/item-status.enum';
import { FormsModule } from '@angular/forms';
import { Api_categoryService } from '../services/api/api_category.service';
import {
  Category,
  CategoryWithChildren,
} from '../../interfaces/category.interface';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  items: ItemWithCategories[] = [];
  loading = true;
  error: string | null = null;

  // Propriétés de recherche
  searchQuery: string = '';
  selectedCategoryId: string = ''; // Gardée pour compatibilité
  selectedCategoryIds: string[] = []; // Nouvelle propriété pour multi-sélection
  filteredItems: ItemWithCategories[] = [];
  categories: CategoryWithChildren[] = [];
  loadingCategories = true;

  // Map pour stocker les relations parent-enfant
  categoryParentMap: Map<string, string> = new Map();

  constructor(
    private itemService: Api_itemService,
    private categoryService: Api_categoryService
  ) {}

  ngOnInit(): void {
    this.loadSalableItems();
    this.loadCategories();
  }

  loadSalableItems(): void {
    this.loading = true;
    this.error = null;

    // Explicitly pass SALABLE status to ensure we only get salable items
    this.itemService.getItemByStatus(ItemStatus.SALABLE).subscribe({
      next: (response) => {
        console.log('Raw response from getItemByStatus:', response);

        if (Array.isArray(response)) {
          // Filter again to ensure only SALABLE items
          this.items = response.filter(
            (item) => Number(item.status) === ItemStatus.SALABLE
          );
        } else {
          const responseObj = response as any;

          if (responseObj.data) {
            // Get items from data property if available
            const itemsData = Array.isArray(responseObj.data)
              ? responseObj.data
              : [responseObj.data]; // Filter for SALABLE items only
            this.items = itemsData.filter(
              (item: ItemWithCategories) =>
                Number(item.status) === ItemStatus.SALABLE
            );
          } else {
            this.items = [];
            console.warn('Could not extract items from response', responseObj);
          }
        }

        this.loading = false;
        console.log('Loaded SALABLE items:', this.items);

        // If no items were found, try using the getAllItems as fallback
        if (this.items.length === 0) {
          this.loadAllItemsAsFallback();
        } else {
          // If items are found, initialize filteredItems with all items
          this.filteredItems = this.items;
        }
      },
      error: (err) => {
        console.error('Error loading items by status:', err);
        this.loadAllItemsAsFallback();
      },
    });
  }

  // Fallback method to load all items and filter for SALABLE ones
  loadAllItemsAsFallback(): void {
    console.log('Using fallback method to load all items and filter');

    this.itemService.getAllItemsWithFallback().subscribe({
      next: (items) => {
        console.log('All items loaded:', items); // Filter for only SALABLE items
        this.items = items.filter(
          (item: ItemWithCategories) =>
            Number(item.status) === ItemStatus.SALABLE
        );
        console.log('Filtered SALABLE items:', this.items);
        this.loading = false;

        // Initialize filteredItems with all salable items
        this.filteredItems = this.items;
      },
      error: (err) => {
        this.error = 'Failed to load items. Please try again later.';
        this.loading = false;
        console.error('Error in fallback loading:', err);
      },
    });
  }

  /**
   * Charge toutes les catégories
   */
  loadCategories(): void {
    this.loadingCategories = true;

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = this.organizeCategories(categories);
        this.ensureAllCategoriesLinked(this.categories);
        this.buildCategoryParentMap(categories); // Construit la map parent-enfant
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loadingCategories = false;
      },
    });
  }

  /**
   * Organise les catégories pour affichage hiérarchique
   * - Place les catégories racines en haut
   * - Trie les catégories par niveau puis par ordre alphabétique
   */
  organizeCategories(
    categories: CategoryWithChildren[]
  ): CategoryWithChildren[] {
    // Créer une carte des catégories par leur ID pour un accès rapide
    const categoryMap = new Map<
      string,
      CategoryWithChildren & { level?: number; displayOrder?: number }
    >();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, level: 0 });
    });

    // Calculer le niveau de chaque catégorie (profondeur dans l'arbre)
    categories.forEach((cat) => {
      if (cat.parentId) {
        let currentCat = cat;
        let level = 0;

        // Remonter l'arbre pour déterminer le niveau
        while (currentCat.parentId && categoryMap.has(currentCat.parentId)) {
          level++;
          currentCat = categoryMap.get(currentCat.parentId)!;
        }

        const catWithMeta = categoryMap.get(cat.id)!;
        catWithMeta.level = level;
      }
    });

    // Trier les catégories
    const sortedCategories = [...categories].sort((a, b) => {
      const aLevel = categoryMap.get(a.id)?.level || 0;
      const bLevel = categoryMap.get(b.id)?.level || 0;

      // D'abord trier par niveau
      if (aLevel !== bLevel) {
        return aLevel - bLevel;
      }

      // Si même niveau, tri alphabétique
      return a.name.localeCompare(b.name);
    });

    // Attacher des propriétés de métadonnées pour l'affichage
    return sortedCategories.map((cat) => {
      const level = categoryMap.get(cat.id)?.level || 0;
      return {
        ...cat,
        level,
        isParent: level === 0,
      } as CategoryWithChildren & { level: number; isParent: boolean };
    });
  }

  /**
   * S'assure que toutes les catégories ont les bons liens parents-enfants
   */
  ensureAllCategoriesLinked(categories: CategoryWithChildren[]): void {
    // Créer une carte de toutes les catégories par ID
    const categoryMap = new Map<string, CategoryWithChildren>();
    categories.forEach((cat) => categoryMap.set(cat.id, cat));

    // Pour chaque catégorie enfant, ajouter une référence dans son parent
    categories
      .filter((cat) => cat.parentId)
      .forEach((child) => {
        const parent = categoryMap.get(child.parentId!);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          // Vérifier si l'enfant n'est pas déjà dans le tableau children du parent
          if (
            !parent.children.some(
              (existingChild) => existingChild.id === child.id
            )
          ) {
            parent.children.push(child);
          }
        }
      });
  }

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

    // S'assurer que les relations parentId sont aussi dans la map
    categories.forEach((cat) => {
      if (cat.parentId && !this.categoryParentMap.has(cat.id)) {
        this.categoryParentMap.set(cat.id, cat.parentId);
      }
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
   * Récupère tous les IDs des catégories enfants (récursif pour tous les niveaux)
   */
  getChildCategoryIds(categoryId: string): string[] {
    const childIds: string[] = [];

    // Fonction pour trouver récursivement tous les enfants
    const findChildren = (parentId: string) => {
      this.categories.forEach((category) => {
        if (category.parentId === parentId) {
          childIds.push(category.id);
          findChildren(category.id);
        }
      });
    };

    findChildren(categoryId);
    return childIds;
  }

  /**
   * Active/désactive une catégorie dans le filtre
   * - Si sélectionnée, ajoute aussi tous les parents
   * - Si désélectionnée, retire aussi tous les enfants
   */
  toggleCategory(categoryId: string): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);

    if (index === -1) {
      // Ajouter la catégorie
      this.selectedCategoryIds.push(categoryId);
      // Met à jour la propriété compatibilité
      this.selectedCategoryId = categoryId;

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

      // Si c'est la catégorie sélectionnée principale, la réinitialiser
      if (this.selectedCategoryId === categoryId) {
        this.selectedCategoryId =
          this.selectedCategoryIds.length > 0
            ? this.selectedCategoryIds[0]
            : '';
      }

      // Supprimer également tous ses enfants
      const childIds = this.getChildCategoryIds(categoryId);
      childIds.forEach((childId) => {
        const childIndex = this.selectedCategoryIds.indexOf(childId);
        if (childIndex !== -1) {
          this.selectedCategoryIds.splice(childIndex, 1);
        }
      });
    }

    // Appliquer les filtres après la modification
    this.applyFilters();
  }

  /**
   * Vérifie si une catégorie est sélectionnée
   */
  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  /**
   * Réinitialise uniquement les filtres de catégories
   */
  resetCategoryFilters(): void {
    this.selectedCategoryIds = [];
    this.selectedCategoryId = '';
    this.applyFilters();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = '';
    this.selectedCategoryIds = [];
    this.applyFilters();
  }

  getImageUrl(item: any): string {
    if (!item || !item.imageUrl) return 'assets/placeholder.png';

    try {
      new URL(item.imageUrl);
      return item.imageUrl;
    } catch (e) {
      if (item.imageUrl.startsWith('/')) {
        return item.imageUrl;
      } else {
        return `assets/${item.imageUrl}`;
      }
    }
  }

  /**
   * Retourne toutes les catégories dans une liste plate avec indentation pour l'affichage dans un dropdown
   */
  getAllCategoriesFlat(): (CategoryWithChildren & {
    displayName: string;
    level: number;
  })[] {
    if (!this.categories || this.categories.length === 0) {
      return [];
    }

    // Formater chaque catégorie avec son nom d'affichage
    return this.categories.map((cat) => {
      const level = (cat as any).level || 0;
      let displayName = this.getCategoryDisplayName(cat as any);
      return {
        ...cat,
        displayName,
        level,
      };
    });
  }

  /**
   * Génère un nom de catégorie avec indentation pour l'affichage hiérarchique
   */
  getCategoryDisplayName(
    category: CategoryWithChildren & { level?: number }
  ): string {
    const level = category.level || 0;

    if (level === 0) {
      return category.name;
    }

    // Ajouter une indentation basée sur le niveau
    const indent = '—'.repeat(level);
    return `${indent} ${category.name}`;
  }

  /**
   * Filtre les items selon les critères de recherche
   */
  applyFilters(): void {
    if (!this.searchQuery && this.selectedCategoryIds.length === 0) {
      this.filteredItems = [...this.items];
      return;
    }

    const searchTermLower = this.searchQuery?.toLowerCase() || '';

    this.filteredItems = this.items.filter((item) => {
      // Filtre par nom, matériau ou description
      const nameMatch =
        !this.searchQuery ||
        (item.name?.toLowerCase() || '').includes(searchTermLower) ||
        (item.material?.toLowerCase() || '').includes(searchTermLower) ||
        (item.description?.toLowerCase() || '').includes(searchTermLower);

      // Filtre par catégorie(s)
      let categoryMatch = this.selectedCategoryIds.length === 0;

      // Si des catégories sont sélectionnées, vérifier si l'item correspond
      if (!categoryMatch && item.categories && item.categories.length > 0) {
        // Un item correspond si au moins une de ses catégories correspond à une catégorie sélectionnée
        // ou si l'item possède une catégorie qui est parent ou enfant d'une catégorie sélectionnée
        console.log(
          `Filtrage de l'item ${item.name} avec catégories sélectionnées:`,
          this.selectedCategoryIds
        );

        categoryMatch = item.categories.some((itemCategory) =>
          this.selectedCategoryIds.some((selectedCatId) => {
            const exactMatch = itemCategory.id === selectedCatId;
            const isParent = this.isParentCategoryOf(
              itemCategory.id,
              selectedCatId
            );
            const isChild = this.isCategoryChildOf(
              itemCategory.id,
              selectedCatId
            );

            if (exactMatch || isParent || isChild) {
              console.log(`Match trouvé pour item ${item.name}`);
            }

            return exactMatch || isParent || isChild;
          })
        );
      }

      return nameMatch && categoryMatch;
    });

    console.log(`Filtered items: ${this.filteredItems.length} matches found.`);
  }

  /**
   * Vérifie si une catégorie est enfant d'une autre (recherche récursive dans la hiérarchie)
   * ou si c'est la même catégorie
   */
  isCategoryChildOf(categoryId: string, parentId: string): boolean {
    if (!categoryId || !parentId) return false;

    // Si c'est la même catégorie, retourner vrai immédiatement
    if (categoryId === parentId) return true;

    // Trouver la catégorie actuelle
    const category = this.categories.find((c) => c.id === categoryId);
    if (!category) return false;

    // Vérifier si c'est un enfant direct
    if (category.parentId === parentId) return true;

    // Si non, vérifier récursivement avec le parent
    return category.parentId
      ? this.isCategoryChildOf(category.parentId, parentId)
      : false;
  }

  /**
   * Vérifie si une catégorie est parent d'une autre (pour inclure les sous-catégories dans les résultats)
   */
  isParentCategoryOf(categoryId: string, childId: string): boolean {
    if (!categoryId || !childId) return false;

    // Si c'est la même catégorie, retourner vrai immédiatement
    if (categoryId === childId) return true;

    // Trouver la catégorie sélectionnée pour voir si elle est parent de la catégorie de l'item
    const childCategory = this.categories.find((c) => c.id === childId);
    if (!childCategory) return false;

    // Récupérer tous les enfants de la catégorie (direct ou indirect)
    const allChildren = this.findAllChildCategories(categoryId);
    return allChildren.some((child) => child.id === childId);
  }

  /**
   * Trouve toutes les catégories enfants d'une catégorie donnée (récursivement)
   */
  findAllChildCategories(parentId: string): CategoryWithChildren[] {
    if (!parentId) return [];

    const directChildren = this.categories.filter(
      (c) => c.parentId === parentId
    );
    let allChildren = [...directChildren];

    // Trouver récursivement les enfants des enfants
    directChildren.forEach((child) => {
      const childrenOfChild = this.findAllChildCategories(child.id);
      allChildren = [...allChildren, ...childrenOfChild];
    });

    return allChildren;
  }
}
