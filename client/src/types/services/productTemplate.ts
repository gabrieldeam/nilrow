// Enums do produto
export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

// Ficha técnica
export interface TechnicalSpecificationTemplateDTO {
  id?: string;
  title: string;
  content: string;
}

// Atributos da variação
export interface VariationTemplateAttributeDTO {
  id?: string;
  attributeName: string;
  attributeValue: string;
}

// Imagem da variação
export interface VariationTemplateImageDTO {
  id?: string;
  variationTemplateId: string;
  imageUrl: string;
  orderIndex?: number;
}

// Variação do Produto
export interface ProductTemplateVariationDTO {
  id?: string;
  name?: string;
  attributes: VariationTemplateAttributeDTO[];
  images?: VariationTemplateImageDTO[]; // Campo opcional para imagens da variação
}

// Produto principal
export interface ProductTemplateDTO {
  id?: string;
  images: string[];
  name: string;
  type: ProductType;
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  netWeight: number;
  grossWeight: number;
  width: number;
  height: number;
  depth: number;
  volumes: number;
  itemsPerBox: number;
  shortDescription: string;
  complementaryDescription: string;
  notes: string;
  technicalSpecifications: TechnicalSpecificationTemplateDTO[];
  variations: ProductTemplateVariationDTO[];
}
