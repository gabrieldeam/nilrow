export interface CategoryListProps {
    icon?: string;
    customIcon?: string;
    title: string;
    paragraph?: string;
    isVerified?: boolean;
    onClick?: () => void;
    className?: string;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  }
  