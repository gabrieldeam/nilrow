import { StaticImageData } from 'next/image';

export interface StepButtonProps {
  icon?: string | StaticImageData; 
  customIcon?: string | StaticImageData; 
  title: string;
  paragraph?: string;
  isVerified?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}
