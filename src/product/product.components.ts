import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Api_itemService } from '../app/services/api_item.service';
import { ItemWithCategories } from '../interfaces/item.interface';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="product-detail" *ngIf="item">
      <div class="product-content">
        <div class="product-image">
          <img [src]="item.imageUrl || 'assets/shirt-icon.png'" [alt]="item.name" class="product-img">
        </div>
        <div class="product-info">
          <h2>{{ item.name }}</h2>
          <p class="product-description">{{ item.description }}</p>
          <div class="product-categories" *ngIf="item.categories?.length">
            <h3>Catégories:</h3>
            <ul>
              <li *ngFor="let category of item.categories">{{ category.name }}</li>
            </ul>
          </div>
          <p class="product-status">État: {{ item.status }}</p>
          <button class="reserve-button" (click)="reserveItem()" [disabled]="item.status !== 'disponible'">
            {{ item.status === 'disponible' ? 'Réserver' : 'Non disponible' }}
          </button>
        </div>
      </div>
    </section>
  `
})
export class ProductComponent implements OnInit {
  item: ItemWithCategories | null = null;

  constructor(
    private route: ActivatedRoute,
    private itemService: Api_itemService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.itemService.getItemById(params['id']).subscribe({
          next: (item) => {
            this.item = item;
          },
          error: (error) => {
            console.error('Erreur lors du chargement de l\'article:', error);
          }
        });
      }
    });
  }

  reserveItem() {
    if (this.item) {
      // TODO: Implement reservation logic
      console.log('Réservation de l\'article:', this.item.id);
    }
  }
}