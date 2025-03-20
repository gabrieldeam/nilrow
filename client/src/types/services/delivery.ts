export interface DeliveryCoordinateDTO {
  id?: string; // id pode ser opcional para novos registros
  latitude: number;
  longitude: number;
}

export interface DeliveryRadiusDTO {
  id?: string; // opcional para identificar registros já salvos
  radius: number;
  price: number;
  averageDeliveryTime: number; // novo campo: tempo médio de entrega
  coordinates?: DeliveryCoordinateDTO[]; // pode ser opcional
}

export interface DeliveryDTO {
  id?: string; // opcional, pois pode não vir no create
  catalogId: string;
  active: boolean;
  radii: DeliveryRadiusDTO[];
}

// Novo DTO para encapsular o preço e o tempo médio de entrega
export interface DeliveryPriceDTO {
  price: number;
  averageDeliveryTime: number;
}
