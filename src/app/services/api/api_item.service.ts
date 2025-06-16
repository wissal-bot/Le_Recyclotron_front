import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, of, catchError, map, throwError } from 'rxjs';
import {
  Item,
  InputItem,
  ItemWithCategories,
} from '../../../interfaces/item.interface';
import { ItemStatus } from '../../../interfaces/item-status.enum';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_itemService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createItem(itemData: InputItem): Observable<Item> {
    console.log('Creating item with data:', itemData);

    // Ensure that the status is sent as a number
    const formattedData = {
      ...itemData,
      status: Number(itemData.status),
    };

    // Add headers to ensure proper content type
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    console.log('Formatted data for API:', formattedData);
    console.log('API URL being used:', `${this.API_URL}/item`);

    return this.http
      .post<Item>(`${this.API_URL}/item`, formattedData, { headers })
      .pipe(
        map((response) => {
          console.log('Create item API response:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating item:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);

          // Log more detailed information about the request
          if (error.error instanceof Error) {
            // A client-side or network error occurred
            console.error('Client-side error:', error.error.message);
          } else {
            // The backend returned an unsuccessful response code
            console.error(
              `Backend returned code ${error.status}, body was:`,
              error.error
            );
          }

          return throwError(() => error);
        })
      );
  }

  getAllItems(): Observable<ItemWithCategories[]> {
    return this.http.get<any>(`${this.API_URL}/item`).pipe(
      map((response) => {
        // Check if response is already an array
        if (Array.isArray(response)) {
          return response;
        }
        // Check if response has a data property containing an array
        else if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Check if response has an items property containing an array
        else if (response && response.items && Array.isArray(response.items)) {
          return response.items;
        }
        // If not a recognized format, log and return empty array
        else {
          console.warn('Unexpected API response format:', response);
          return [];
        }
      })
    );
  }

  getItemById(id: string): Observable<ItemWithCategories> {
    return this.http.get<any>(`${this.API_URL}/item/${id}`).pipe(
      map((response) => {
        // Log the response for debugging
        console.log('Item detail API response:', response);

        // Check if response is directly an item object with expected properties
        if (response && typeof response === 'object' && response.id) {
          return this.normalizeItem(response);
        }
        // Check if response has data property containing the item
        else if (
          response &&
          response.data &&
          typeof response.data === 'object'
        ) {
          return this.normalizeItem(response.data);
        }
        // Check if response has item property containing the item
        else if (
          response &&
          response.item &&
          typeof response.item === 'object'
        ) {
          return this.normalizeItem(response.item);
        }
        // If not in an expected format
        else {
          console.warn('Unexpected item detail API response format:', response);
          throw new Error('Invalid item data format received');
        }
      })
    );
  }

  // Helper method to normalize item data and ensure all required fields exist
  private normalizeItem(item: any): ItemWithCategories {
    // Convert status string to number if needed
    let status: number;
    if (typeof item.status === 'string') {
      // Try to parse as number
      const parsedStatus = parseInt(item.status, 10);
      if (!isNaN(parsedStatus)) {
        status = parsedStatus;
      } else {
        // Default to UNSALABLE if parsing fails
        status = ItemStatus.UNSALABLE;
      }
    } else if (typeof item.status === 'number') {
      status = item.status;
    } else {
      // Default status if missing
      status = ItemStatus.UNSALABLE;
    }

    return {
      id: item.id || '',
      name: item.name || 'Unknown Item',
      material: item.material || 'Unknown',
      status: status,
      image: item.image || item.imageUrl || '/assets/placeholder.png', // Accept both image and imageUrl for backward compatibility
      categories: Array.isArray(item.categories) ? item.categories : [],
    };
  }

  getItemByStatus(status: ItemStatus): Observable<ItemWithCategories[]> {
    console.log(
      `Fetching items with status ${status} from ${this.API_URL}/item/status/${status}`
    );
    return this.http.get<any>(`${this.API_URL}/item/status/${status}`).pipe(
      map((response) => {
        console.log('Raw response from getItemByStatus:', response);

        // Check if response is already an array
        if (Array.isArray(response)) {
          return response.map((item: any) => this.normalizeItem(item));
        }
        // Check if response has a data property containing an array
        else if (response && response.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => this.normalizeItem(item));
        }
        // Check if response has an items property containing an array
        else if (response && response.items && Array.isArray(response.items)) {
          return response.items.map((item: any) => this.normalizeItem(item));
        }
        // If not a recognized format, log and return empty array
        else {
          console.warn(
            'Unexpected API response format for getItemByStatus:',
            response
          );
          return [];
        }
      }),
      catchError((error) => {
        console.error(`Error fetching items with status ${status}:`, error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  updateItemById(
    id: string,
    itemData: Partial<InputItem>
  ): Observable<ItemWithCategories> {
    console.log(`Updating item ${id} with data:`, itemData);

    // Ensure that the status is sent as a number
    const formattedData = {
      ...itemData,
      status:
        itemData.status !== undefined ? Number(itemData.status) : undefined,
    };

    console.log('Formatted data for API:', formattedData);

    return this.http.put<any>(`${this.API_URL}/item/${id}`, formattedData).pipe(
      map((response) => {
        console.log('Update response:', response);

        // Handle different response formats
        if (response && typeof response === 'object' && response.id) {
          return this.normalizeItem(response);
        } else if (
          response &&
          response.data &&
          typeof response.data === 'object'
        ) {
          return this.normalizeItem(response.data);
        } else if (
          response &&
          response.item &&
          typeof response.item === 'object'
        ) {
          return this.normalizeItem(response.item);
        } else if (response && response.success) {
          // Some APIs just return success flag
          // In this case, we'll get the updated item separately
          console.log('Update successful, fetching updated item');
          // Return a placeholder that will be replaced
          return { id, ...itemData } as any as ItemWithCategories;
        } else {
          console.warn('Unexpected update response format:', response);
          throw new Error('Invalid response format');
        }
      }),
      catchError((error) => {
        console.error('Error updating item:', error);
        throw error;
      })
    );
  }

  deleteItemById(id: string): Observable<void> {
    console.log(`Deleting item ${id}`);

    return this.http.delete<any>(`${this.API_URL}/item/${id}`).pipe(
      map((response) => {
        console.log('Delete response:', response);

        // Most APIs return either nothing (void) or a success indicator
        if (!response || (response && response.success)) {
          return;
        } else {
          console.warn('Unexpected delete response format:', response);
          // Still return void as the operation likely succeeded
          return;
        }
      }),
      catchError((error) => {
        console.error('Error deleting item:', error);
        throw error;
      })
    );
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

  /**
   * Enhanced method to get all items with fallback to products if the item endpoint fails
   */
  getAllItemsWithFallback(): Observable<ItemWithCategories[]> {
    // First try the regular item endpoint
    return this.getAllItems().pipe(
      catchError((error) => {
        console.warn(
          'Item endpoint failed, trying product endpoint as fallback',
          error
        );
        // If it fails, try the product endpoint and map the response
        return this.getProductsAsItems();
      })
    );
  }

  /**
   * Fallback method that fetches products and maps them to the item interface
   */
  private getProductsAsItems(): Observable<ItemWithCategories[]> {
    return this.http.get<any>(`${this.API_URL}/product`).pipe(
      map((response) => {
        console.log('Fetched products as fallback for items:', response);
        let productsArray: any[] = [];

        // Ensure we have a valid array of products
        if (Array.isArray(response)) {
          productsArray = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            productsArray = response.data;
          } else if (response.products && Array.isArray(response.products)) {
            productsArray = response.products;
          } else {
            console.error('Cannot extract product array from response');
            return [];
          }
        } else {
          console.error('Invalid response from product API');
          return [];
        }

        // Map product data to match the ItemWithCategories interface
        return productsArray.map((product) => ({
          id: product.id || '',
          name: product.name || '',
          material: product.material || '',
          // Convert status to ItemStatus enum if possible
          status: this.convertStatusFromString(product.status),
          image: product.image || product.imageUrl || '/assets/placeholder.png',
          categories: product.categories || [],
        }));
      }),
      catchError((error) => {
        console.error('Both item and product endpoints failed', error);
        return of([]); // Return empty array if both endpoints fail
      })
    );
  }

  /**
   * Helper to convert string status to number
   */
  private convertStatusFromString(
    status: string | number | undefined
  ): ItemStatus {
    if (typeof status === 'number') {
      return status;
    }

    if (status === 'available' || status === 'SALABLE') {
      return ItemStatus.SALABLE;
    } else if (status === 'reparable' || status === 'REPARABLE') {
      return ItemStatus.REPARABLE;
    } else if (status === 'material' || status === 'MATERIAL') {
      return ItemStatus.MATERIAL;
    } else {
      return ItemStatus.UNSALABLE;
    }
  }
}
