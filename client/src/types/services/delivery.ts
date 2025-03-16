
export interface DeliveryCoordinateDTO {
    id: string;
    latitude: number;
    longitude: number;
  }
  
  export interface DeliveryRadiusDTO {
    id: string;
    radius: number;
    price: number;
    coordinates: DeliveryCoordinateDTO[];
  }
  
  export interface DeliveryDTO {
    id: string;
    catalogId: string;
    active: boolean;
    radii: DeliveryRadiusDTO[];
  }
  