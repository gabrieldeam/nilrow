export interface ButtonItem {
    image: string; // URL da imagem do botão
    link?: string; // link é opcional
    onClick?: () => void; // função onClick opcional
  }
  
  export interface ProductCardProps {
    images: string[];
    name: string;
    price: number | string; // Aceita number ou string
    freeShipping: boolean;
    buttons?: ButtonItem[];
  }