import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category,
  InputCategory,
  CategoryWithChildren,
} from '../../interfaces/category.interface';
import { environment } from '../../environments/environment';

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
    return this.http.get<CategoryWithChildren[]>(`${this.API_URL}/categories`);
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
