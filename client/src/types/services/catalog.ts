export interface CatalogDTO {
    title: string;
    description: string;
    isVisible: boolean;
  }
  
  export interface CatalogData {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
  }
  
  export interface AddressData {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface LocationData {
    id: string;
    latitude: number;
    longitude: number;
    address: AddressData;
  }
  