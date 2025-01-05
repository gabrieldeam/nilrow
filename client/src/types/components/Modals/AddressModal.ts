export interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    cep: string;
  }
  
  export interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  