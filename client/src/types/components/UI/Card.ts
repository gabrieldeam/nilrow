export interface Link {
    href: string;
    text: string;
  }
  
  export interface Button {
    onClick: () => void;
    text: string;
  }
  
  export interface CardProps {
    title?: string;
    children: React.ReactNode;
    leftLink?: Link;
    rightLink?: Link;
    rightButton?: Button;
  }
  