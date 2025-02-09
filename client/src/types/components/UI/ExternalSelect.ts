export interface IExternalSelectOption {
    value: string;
    label: string;
  }
  
  export interface IExternalSelectProps {
    title?: string;
    placeholder?: string;
    bottomLeftText?: string;
    bottomRightLink?: {
      href: string;
      text: string;
    } | null;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value?: string;
    name?: string;
    isValid?: boolean;
    prefix?: string;
    readOnly?: boolean;
    options: IExternalSelectOption[];
  }
  