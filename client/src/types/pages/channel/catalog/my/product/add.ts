
export interface ImageData {
  id?: string;
  file?: File;
  preview: string;
  isNew?: boolean; 
}

export interface ProductAttribute {
  attributeName: string;    
  values: string[];          
}