import { StaticImageData } from 'next/image';

export interface StageButtonProps {
  text: string;
  backgroundColor?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  imageSrc?: string | StaticImageData; 
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  width?: string;
}
