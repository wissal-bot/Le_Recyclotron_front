import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Api_categoryService } from '../../../services/api/api_category.service';

@Component({
  selector: 'app-category-delete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-delete.component.html',
  styleUrls: ['./category-delete.component.css'],
})
export class CategoryDeleteComponent implements OnInit {
  loading = false;
  success = false;
  error: string | null = null;
  categoryId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: Api_categoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = params.get('id');
    });
  }

  confirmDelete(): void {
    if (!this.categoryId) return;
    this.loading = true;
    this.categoryService.deleteCategory(this.categoryId).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors de la suppression';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
