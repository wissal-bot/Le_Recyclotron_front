export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: Category[];
}

export interface InputCategory {
  name: string;
  description: string;
  parentId?: string;
}

export interface PartialCategory {
  name?: string;
  description?: string;
  parentId?: string;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}
