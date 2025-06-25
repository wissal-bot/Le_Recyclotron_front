import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category,
  InputCategory,
  CategoryWithChildren,
} from '../../../interfaces/category.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_categoryService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createCategory(data: InputCategory): Observable<Category> {
    return this.http.post<Category>(`${this.API_URL}/categories`, data);
  }

  createChildCategory(
    parentId: string,
    data: InputCategory
  ): Observable<Category> {
    return this.http.post<Category>(
      `${this.API_URL}/categories/${parentId}`,
      data
    );
  }

  getAllCategories(): Observable<CategoryWithChildren[]> {
    return new Observable<CategoryWithChildren[]>((observer) => {
      this.http.get<any>(`${this.API_URL}/categories`).subscribe({
        next: (data) => {
          let cats: any[] = [];
          if (Array.isArray(data)) {
            cats = data;
          } else if (data && Array.isArray(data.data)) {
            cats = data.data;
          } else if (data && Array.isArray(data.categories)) {
            cats = data.categories;
          }
          observer.next(this.validateCategories(cats));
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  validateCategories(categories: any[]): CategoryWithChildren[] {
    if (!Array.isArray(categories)) {
      console.error('Les données reçues ne sont pas un tableau:', categories);
      return [];
    }
    return categories.map((cat) => {
      return {
        id: cat.id?.toString() || '',
        name: cat.name || '',
        parentId: cat.parentId || undefined,
        children: Array.isArray(cat.children) ? cat.children : [],
      };
    });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/categories/${id}`);
  }

  updateCategory(
    id: string,
    data: Partial<Category>
  ): Observable<CategoryWithChildren> {
    return this.http.put<CategoryWithChildren>(
      `${this.API_URL}/categories/${id}`,
      data
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categories/${id}`);
  }
}
