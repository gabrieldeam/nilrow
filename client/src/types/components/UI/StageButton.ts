import { StaticImageData } from 'next/image'; // Importa o tipo para suportar imagens otimizadas pelo Next.js

export interface StageButtonProps {
  text: string;
  backgroundColor?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  imageSrc?: string | StaticImageData; // Suporta strings ou imagens otimizadas
}
