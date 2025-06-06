export interface BottomRightLink {
    href: string;
    text: string;
  }
  
  export interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    label: string;
  }
  
  export interface CustomInputProps {
    title?: string;
    placeholder?: string;
    bottomLeftText?: string;
    bottomRightLink?: BottomRightLink | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    value?: string | number;
    type?: string;
    name?: string;
    isValid?: boolean;
    prefix?: string;
    readOnly?: boolean;
    checkbox?: CheckboxProps | null;
    isTextarea?: boolean;
    disabled?: boolean;
  }