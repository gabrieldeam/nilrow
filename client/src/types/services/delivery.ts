export interface DeliveryCoordinateDTO {
  id?: string; // id pode ser opcional para novos registros
  latitude: number;
  longitude: number;
}

export interface DeliveryRadiusDTO {
  id?: string; // opcional para identificar registros já salvos
  radius: number;
  price: number;
  coordinates?: DeliveryCoordinateDTO[]; // pode ser opcional
}

export interface DeliveryDTO {
  id?: string; // opcional, pois pode não vir no create
  catalogId: string;
  active: boolean;
  radii: DeliveryRadiusDTO[];
}
