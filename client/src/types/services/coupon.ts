/* ---------- TIPOS / DTOs ---------- */

export enum DiscountType {
    PERCENTAGE   = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
  }
  
  export interface CouponCoordinateDTO {
    id?: string;
    latitude: number;
    longitude: number;
  }
  
  export interface CouponRadiusDTO {
    id?: string;
    radius: number;                               // km
    coordinates: CouponCoordinateDTO[];
  }
  
  export interface CouponDTO {
    id?: string;
    code: string;
    catalogId: string;
  
    active: boolean;
  
    discountType: DiscountType;
    /** Pode vir como número ou string (BigDecimal do back) */
    discountValue: number | string;
  
    perUserLimit: number;
    totalLimit: number;
    totalUsed?: number;
  
    startsAt?: string;          // ISO 8601
    endsAt?: string;            // ISO 8601
  
    /* Escopo de aplicação */
    categoryIds?: string[];
    subCategoryIds?: string[];
    productIds?: string[];
  
    radii?: CouponRadiusDTO[];
  }
  
  export interface CouponAvailabilityDTO {
    valid: boolean;
    /** Valor a ser abatido do carrinho (0 se inválido) */
    discountToApply: number | string;
  }
  