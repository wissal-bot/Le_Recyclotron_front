import { Component, OnInit } from '@angular/core';
import { Api_itemService } from '../services/api_item.service';
import { ItemWithCategories } from '../../interfaces/item.interface';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
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
      },
    });
  }
}
