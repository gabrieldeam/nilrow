export interface CategoryDTO {
    name: string;
  }
  
  export interface SubCategoryDTO {
    name: string;
    categoryId: string;
  }
  
  export interface UserCategoryOrderDTO {
    categoryId: string;
    displayOrder: number;
  }
  
  export interface CategoryData {
    id: string;
    name: string;
    imageUrl?: string;
  }
  
  export interface SubCategoryData {
    id: string;
    name: string;
    categoryId: string;
  }
  