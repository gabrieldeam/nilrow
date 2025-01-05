import { StaticImageData } from 'next/image'; // Importa o tipo StaticImageData

export interface ConfirmationButtonProps {
  text: string;
  backgroundColor: string;
  icon?: string | StaticImageData; // Suporta strings ou imagens estáticas otimizadas pelo Next.js
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}
