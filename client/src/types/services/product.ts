// product.ts (arquivo de types do front)

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

export interface ProductDTO {
  id: string;
  catalogId: string;
  images: string[];
  name: string;
  skuCode: string;
  salePrice: number;
  discountPrice: number;
  unitOfMeasure: string;
  type: ProductType;           // Agora é do enum
  condition: ProductCondition; // Enum
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  productionType: ProductionType; // Enum
  expirationDate: string | null;  // Permite null ou string de data
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
  associated: string[]; // Se for 'associatedIds' no back, ajuste. 
}
