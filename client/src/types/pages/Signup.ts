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

  export interface StepProps {
    formData: SignupFormData;
    setFormData: React.Dispatch<React.SetStateAction<SignupFormData>>;
    handleStepCompletion: (step: string, data?: Partial<SignupFormData>) => void;
  }
  