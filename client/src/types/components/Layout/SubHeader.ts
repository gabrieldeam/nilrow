export interface SubHeaderProps {
  title: string;
  handleBack?: () => void;
  handleDelete?: () => void;
  showDeleteButton?: boolean;
  showOrdersButton?: boolean;
  handleOrders?: () => void;
  showActiveFilterButton?: boolean;
  handleActiveFilter?: () => void;
  showTemplateButton?: boolean; // nova prop para exibir o botão Template
  handleTemplate?: () => void;    // nova prop para o clique no botão Template
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: () => void;
}
