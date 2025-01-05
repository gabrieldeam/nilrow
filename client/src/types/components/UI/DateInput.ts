export interface DateInputProps {
    title?: string;
    onChange: (event: { target: { name: string; value: string } }) => void;
    value: string;
    name: string;
    bottomLeftText?: string;
  }
  