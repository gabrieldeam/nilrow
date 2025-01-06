export interface Category {
    id: string | number;
    name: string;
    imageUrl: string;
  }
  
  export interface UserCategoryOrder {
    categoryId: string | number;
    displayOrder: number;
  }