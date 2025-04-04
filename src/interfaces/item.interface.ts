import { Category } from './category.interface';

export interface Item {
  id: string;
  name: string;
  material: string;
  status: string;
  imageUrl: string;
}

export interface InputItem {
  name: string;
  material: string;
  status: string;
  imageUrl: string;
}

export interface PartialItem {
  name?: string;
  material?: string;
  status?: string;
  imageUrl?: string;
}

export interface ItemWithCategories extends Item {
  categories: Category[];
}
