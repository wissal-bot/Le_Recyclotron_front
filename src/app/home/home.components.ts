import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="about-section">
      <div class="about-content">
        <div class="image-container">
          <img src="assets/store.jpg" alt="Notre magasin" class="store-image">
        </div>
        <div class="text-content">
          <h2>À PROPOS DE NOUS</h2>
          <p>Bienvenue chez Le Recyclotron, votre destination éco-responsable pour donner une seconde vie aux objets. Notre mission est de promouvoir le recyclage et la réutilisation tout en créant une communauté engagée pour un avenir plus durable.</p>
          <button class="member-button" routerLink="/register">Devenir membre</button>
        </div>
      </div>
    </section>

    <section class="products-grid">
      <div class="product-card" *ngFor="let item of items">
        <img [src]="item.imageUrl || 'assets/shirt-icon.png'" [alt]="item.name" class="product-icon">
        <p class="product-title">{{ item.name }}</p>
        <p class="product-status">{{ item.status }}</p>
        <button class="plus-button" [routerLink]="['/product', item.id]">Voir plus</button>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  items: ItemWithCategories[] = [];

  constructor(private itemService: Api_itemService) {}

  ngOnInit() {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
      }
    });
  }
}