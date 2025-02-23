// Representa um atributo de variação
export interface VariationAttributeDTO {
  id: string;
  variationId: string;
  attributeName: string;
  attributeValue: string;
}

// Representa uma variação de um produto (para produtos)
export interface ProductVariationDTO {
  id: string;
  productId: string;
  attributes: VariationAttributeDTO[];
  price: number;
  stock: number;
  active: boolean;
}

// Representa uma variação de template de produto
// Caso o DTO seja diferente, ajuste os campos conforme necessário
export interface ProductTemplateVariationDTO {
  id: string;
  attributes: VariationAttributeDTO[];
  price: number;
  stock: number;
  active: boolean;
}

// Representa um template de produto
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
  variations: ProductTemplateVariationDTO[];
}

// Representa um produto
export interface ProductDTO {
  id: string;
  catalogId: string;
  images: string[];
  name: string;
  skuCode: string;
  salePrice: number;
  discountPrice: number;
  unitOfMeasure: string;
  type: string; // Considere definir um enum se os valores forem limitados
  condition: string; // Considere definir um enum se os valores forem limitados
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  productionType: string; // Considere definir um enum se os valores forem limitados
  expirationDate: string; // Data em formato ISO (pode ser convertida para Date se necessário)
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
  variations: ProductVariationDTO[];
}
