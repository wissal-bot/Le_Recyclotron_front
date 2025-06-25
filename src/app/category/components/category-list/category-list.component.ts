import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api_categoryService } from '../../../services/api/api_category.service';
import { CategoryWithChildren } from '../../../../interfaces/category.interface';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  categories: CategoryWithChildren[] = [];
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private categoryService: Api_categoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalItems = data.length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des catégories';
        this.loading = false;
      },
    });
  }

  get paginatedCategories(): CategoryWithChildren[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.categories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getParentName(parentId: string | undefined): string {
    if (!parentId) return '';
    const parent = this.categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : '';
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
}
