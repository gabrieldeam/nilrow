export interface ProfileData {
  name?: string;
  email: string;
  phone: string; 
  nickname: string;
}

  export interface AddressData {
    street: string;
    city: string;
    state: string;
    cep: string;
  }

  export interface FormDataProps {
    email: string;
    phone: string;
    nickname: string;
  }
  
  export type ProfileUpdateData = Partial<ProfileData>;
  