import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemWithCategories } from '../../../../interfaces/item.interface';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent {
  @Input() item!: ItemWithCategories;
  @Output() viewDetails = new EventEmitter<string>();

  constructor() {}

  onViewDetails(): void {
    this.viewDetails.emit(this.item.id);
  }
}
