import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  item: ItemWithCategories | null = null;

  constructor(
    private route: ActivatedRoute,
    private itemService: Api_itemService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.itemService.getItemById(params['id']).subscribe({
          next: (item) => {
            this.item = item;
          },
          error: (error) => {
            console.error("Erreur lors du chargement de l'article:", error);
          },
        });
      }
    });
  }

  reserveItem() {
    if (this.item) {
      // TODO: Implement reservation logic
      console.log("Réservation de l'article:", this.item.id);
    }
  }
}
