import { VariationAttributeDTO } from './product';
import { SimpleChannelDTO } from './channel';

export interface CartItemRequest {
    productId?: string;
    variationId?: string;
    quantity: number;
  }
  
  /**
   * Representação de um item dentro do carrinho
   */
  export interface CartItemDTO {
    id: string;
    productId: string;
    variationId?: string | null;
    name: string;
    imageUrl?: string | null;
    unitPrice: number;
    discountPrice?: number | null;
    quantity: number;
    attributes: VariationAttributeDTO[];
    channel: SimpleChannelDTO;
  }
  
  /**
   * Representação completa do carrinho
   */
  export interface CartDTO {
    cartId: string;
    items: CartItemDTO[];
    total: number;
  }
  