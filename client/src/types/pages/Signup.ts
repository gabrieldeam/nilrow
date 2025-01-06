export interface SignupFormData {
  email?: string;
  phone?: string;
  name?: string;
  cpf?: string;
  birthDate?: string;
  nickname?: string;
  password: string; 
  confirmPassword: string; 
  acceptsSms?: boolean;
}
