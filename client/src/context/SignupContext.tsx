'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SignupFormData } from '@/types/pages/Signup';

interface SignupContextType {
  formData: SignupFormData;
  setFormData: React.Dispatch<React.SetStateAction<SignupFormData>>;
  completedSteps: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
  handleStepCompletion: (step: string, data?: Partial<SignupFormData>) => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    phone: '',
    name: '',
    cpf: '',
    birthDate: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    acceptsSms: false,
  });

  const [completedSteps, setCompletedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const handleStepCompletion = useCallback(
    (step: string, data?: Partial<SignupFormData>) => {
      // Marca o step como concluído
      setCompletedSteps((prev) => ({ ...prev, [step]: true }));
      // Atualiza os dados do formulário, se houver
      if (data) {
        setFormData((prev) => ({ ...prev, ...data }));
      }
      // Redireciona para a tela principal do signup
      router.push('/signup');
    },
    [router]
  );

  return (
    <SignupContext.Provider value={{ formData, setFormData, completedSteps, handleStepCompletion }}>
      {children}
    </SignupContext.Provider>
  );
}

// Hook para uso do contexto em outros componentes
export const useSignupContext = (): SignupContextType => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignupContext must be used within a SignupProvider');
  }
  return context;
};
