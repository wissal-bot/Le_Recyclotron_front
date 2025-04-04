export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface InputCategory {
  name: string;
  parentId?: string;
}

export interface PartialCategory {
  name?: string;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}
