import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Item,
  InputItem,
  ItemWithCategories,
} from '../../interfaces/item.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_itemService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createItem(itemData: InputItem): Observable<Item> {
    return this.http.post<Item>(`${this.API_URL}/item`, itemData);
  }

  getAllItems(): Observable<ItemWithCategories[]> {
    return this.http.get<ItemWithCategories[]>(`${this.API_URL}/item`);
  }

  getItemById(id: string): Observable<ItemWithCategories> {
    return this.http.get<ItemWithCategories>(`${this.API_URL}/item/${id}`);
  }

  getItemByStatus(status: number): Observable<ItemWithCategories[]> {
    console.log(`${this.API_URL}/item/status/${status}`);
    return this.http.get<ItemWithCategories[]>(
      `${this.API_URL}/item/status/${status}`
    );
  }

  updateItemById(
    id: string,
    itemData: Partial<InputItem>
  ): Observable<ItemWithCategories> {
    return this.http.put<ItemWithCategories>(
      `${this.API_URL}/item/${id}`,
      itemData
    );
  }

  deleteItemById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/item/${id}`);
  }

  addCategoryToItem(
    itemId: string,
    categoryId: string
  ): Observable<ItemWithCategories> {
    return this.http.post<ItemWithCategories>(
      `${this.API_URL}/item/${itemId}/categories/${categoryId}`,
      {}
    );
  }

  deleteCategoryOfItem(itemId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/item/${itemId}/categories/${categoryId}`
    );
  }
}
