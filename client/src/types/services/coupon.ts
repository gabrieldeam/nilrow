import {
  CartItemDTO
} from '../services/cart';

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
    discountValue: number | string;  
    perUserLimit: number;
    totalLimit: number;
    totalUsed?: number;  
    startsAt?: string; 
    endsAt?: string; 
    categoryIds?: string[];
    subCategoryIds?: string[];
    productIds?: string[];  
    radii?: CouponRadiusDTO[];
  }
  
  export interface CouponCheckRequest {
    catalogId: string;
    code: string;
    items: CartItemDTO[];
    lat: number;
    lon: number;
  }
  
  /* === resposta do backend === */
  export interface CouponDiscountDTO {
    valid: boolean;
    discountToApply: number;   // BigDecimal → number
    message: string;           // nova informação para exibir ao usuário
  }