import { StaticImageData } from 'next/image';

export interface HeaderButtonProps {
  text?: string;
  icon?: string | StaticImageData;
  link?: string;
  newTab?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}
