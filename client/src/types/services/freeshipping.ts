// DTO que representa um ponto geográfico
export interface FreeShippingCoordinateDTO {
    id?: string;          // opcional para coordenadas já salvas
    latitude: number;
    longitude: number;
  }
  
  // DTO que representa um “raio” de frete grátis
  export interface FreeShippingRadiusDTO {
    id?: string;                              // opcional
    radius: number;                           // raio em km
    minCartValue: number;                     // valor mínimo do carrinho para zerar o frete
    averageDeliveryTime: number;              // tempo médio de entrega
    coordinates?: FreeShippingCoordinateDTO[];// polígono (opcional na criação)
  }
  
  // DTO principal, vinculado a um catálogo
  export interface FreeShippingDTO {
    id?: string;                  // opcional em POST
    catalogId: string;
    active: boolean;
    radii: FreeShippingRadiusDTO[];
  }
  
  // Resposta da verificação de elegibilidade
  export interface FreeShippingAvailabilityDTO {
    freeShippingAvailable: boolean;
    averageDeliveryTime: number;  // 0 se não elegível
  }
  