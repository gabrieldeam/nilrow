// Enum para tipo de produto
export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

// Enum para condição do produto
export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
}

// Enum para tipo de produção
export enum ProductionType {
  OWN = 'OWN',
  THIRD_PARTY = 'THIRD_PARTY',
}

// Interface para Especificação Técnica (Ficha Técnica)
export interface TechnicalSpecificationDTO {
  id?: string; // opcional para novos registros
  title: string;
  content: string;
}

// Interface para Atributos das Variações
export interface VariationAttributeDTO {
  id?: string;
  attributeName?: string;
  attributeValue?: string;
}

// Interface para Variação do Produto
export interface ProductVariationDTO {
  id?: string;
  images?: string[];
  price?: number;
  discountPrice?: number;
  stock?: number;
  active: boolean;
  attributes: VariationAttributeDTO[];
}

// Interface para o Produto
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
