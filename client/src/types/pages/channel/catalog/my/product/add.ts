
export interface ImageData {
  file?: File;
  preview: string;
  isNew?: boolean; 
}

export interface ProductAttribute {
  attributeName: string;    
  values: string[];          
}