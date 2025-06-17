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

  constructor(private categoryService: Api_categoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des catégories';
        this.loading = false;
      },
    });
  }
}
