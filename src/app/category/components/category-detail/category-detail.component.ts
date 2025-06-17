import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Api_categoryService } from '../../../services/api/api_category.service';
import { CategoryWithChildren } from '../../../../interfaces/category.interface';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css'],
})
export class CategoryDetailComponent implements OnInit {
  category: CategoryWithChildren | null = null;
  loading = true;
  error: string | null = null;
  categoryId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private categoryService: Api_categoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = params.get('id');
      if (this.categoryId) {
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (cat) => {
            // S'assurer que 'children' existe pour respecter CategoryWithChildren
            this.category = { ...cat, children: (cat as any).children ?? [] };
            this.loading = false;
          },
          error: () => {
            this.error = 'Erreur lors du chargement de la catégorie';
            this.loading = false;
          },
        });
      }
    });
  }
}
