// Enums do produto
export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
}

export enum ProductionType {
  OWN = 'OWN',
  THIRD_PARTY = 'THIRD_PARTY',
}

// Ficha técnica
export interface TechnicalSpecificationDTO {
  id?: string;
  title: string;
  content: string;
}

// Atributos da variação
export interface VariationAttributeDTO {
  id?: string;
  attributeName?: string;
  attributeValue?: string;
}

// Variação do Produto (sem campo de imagens)
export interface ProductVariationDTO {
  id?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  active: boolean;
  attributes: VariationAttributeDTO[];
}

export interface VariationImageDTO {
  id?: string;
  variationId: string;
  imageUrl: string;
  orderIndex?: number;
}

// Produto principal
export interface ProductDTO {
  id?: string;
  catalogId: string;
  productTemplateId?: string;
  images: string[];
  name: string;
  skuCode: string;
  salePrice: number;
  discountPrice: number;
  unitOfMeasure: string;
  type: ProductType;
  condition: ProductCondition;
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  productionType: ProductionType;
  expirationDate?: string | null;
  freeShipping: boolean;
  netWeight: number;
  grossWeight: number;
  width: number;
  height: number;
  depth: number;
  volumes: number;
  itemsPerBox: number;
  gtinEan: string;
  gtinEanTax: string;
  shortDescription: string;
  complementaryDescription: string;
  notes: string;
  stock: number;
  active: boolean;
  technicalSpecifications: TechnicalSpecificationDTO[];
  variations: ProductVariationDTO[];
}
