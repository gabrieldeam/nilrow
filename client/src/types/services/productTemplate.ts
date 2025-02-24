export interface ProductTemplateDTO {
  id: string;
  images: string[];
  name: string;
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  netWeight: number;
  grossWeight: number;
  unitOfMeasure: string;
  itemsPerBox: number;
  associatedTemplateIds: string[]; 
  productsId?: string[];      
}
