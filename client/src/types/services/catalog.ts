export interface CatalogDTO {
    title: string;
    description: string;
    isVisible: boolean;
    name: string;
    nameBoss: string;
    cnpj: string;
    email: string;
    phone: string;
    addressId: string | number | null;
    addressStreet: string;
    addressCep: string;
    addressCity: string;
    addressState: string;
    addressRecipientName: string;
    addressRecipientPhone: string;
  }

  export interface OpenCloseTime {
    open: string;
    close: string;
  }
  
  export interface DayInfo {
    openCloseTimes: OpenCloseTime[];
    is24Hours: boolean;
    isClosed: boolean;
  }
  
  export interface CatalogData {
    id: string;
    addressId?: string;
    title: string;
    description: string;
    isVisible: boolean;
  }
  
  export interface AddressData {
    id: string;
    street: string;
    city: string;
    state: string;
    cep: string;
  }
  
  export interface LocationData {
    id: string;
    latitude: number;
    longitude: number;
    address: AddressData;
    name?: string;
    action?: "include" | "exclude";
    includedPolygons?: [number, number][][]; 
    excludedPolygons?: [number, number][][];
  }
  
  export interface CatalogDataWithAddress extends CatalogData {
    addressId?: string;
    cnpj?: string;
    address?: AddressData | null;
}
