export interface PickupDTO {
    id: string;
    catalogId: string;
    active: boolean;
    prazoRetirada: number;
    precoRetirada: number;
  }
  
  export interface AddressDTO {
    id: string;
    recipientName: string;
    recipientPhone: string;
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
    classification: string;
    moreInformation?: string;
  }
  
  export interface PickupActiveDetailsDTO {
    active: boolean;
    prazoRetirada: number;
    precoRetirada: number;
    address: AddressDTO;
  }
  