import { Category } from './category.interface';
import { ItemStatus } from './item-status.enum';

export interface Item {
  id: string;
  name: string;
  material: string;
  status: ItemStatus | number;
  image: string;
}

export interface InputItem {
  name: string;
  material: string;
  status: ItemStatus | number;
  image: string;
}

export interface PartialItem {
  name?: string;
  material?: string;
  status?: ItemStatus | number;
  image?: string;
}

export interface ItemWithCategories extends Item {
  categories: Category[];
}
