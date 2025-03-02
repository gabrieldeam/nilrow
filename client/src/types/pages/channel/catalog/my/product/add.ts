import { ProductDTO } from '@/types/services/product';

export interface ImageData {
  file: File;
  preview: string;
}

export interface AssociatedImageData {
  file: File;
  preview: string;
}

export interface AssociatedProductInput
  extends Omit<ProductDTO, 'id' | 'images' | 'associated'> {
  id?: string;
  uploadedImages?: AssociatedImageData[];
  isRemoved?: boolean;
  images?: string[];
}
