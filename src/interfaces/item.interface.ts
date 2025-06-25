import { Category } from './category.interface';
import { ItemStatus } from './item-status.enum';

export interface Item {
  id: string;
  name: string;
  material: string;
  status: ItemStatus | number;
  image: string;
  description?: string; // Optional description field
}

export interface InputItem {
  name: string;
  material: string;
  status: ItemStatus | number;
  image: string;
  description?: string; // Optional description field
  categories?: string[] | Category[]; // Optional categories for creation
}

export interface PartialItem {
  name?: string;
  material?: string;
  status?: ItemStatus | number;
  image?: string;
  description?: string; // Optional description field
  categories?: string[] | Category[]; // Pour permettre la mise à jour des catégories
}

export interface ItemWithCategories extends Item {
  categories: Category[];
}
