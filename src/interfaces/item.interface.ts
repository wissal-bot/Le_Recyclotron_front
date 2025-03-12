import { Category } from './category.interface';

export interface Item {
  id: string;
  name: string;
  description: string;
  status: string;
  categories?: Category[];
}

export interface InputItem {
  name: string;
  description: string;
  status: string;
}

export interface PartialItem {
  name?: string;
  description?: string;
  status?: string;
}

export interface ItemWithCategories extends Item {
imageUrl: any;
  categories: Category[];
}
