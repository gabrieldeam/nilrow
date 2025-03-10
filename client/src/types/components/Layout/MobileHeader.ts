export interface MobileHeaderProps {
  title?: string | null;
  buttons: {
    address?: boolean;
    close?: boolean;
    chat?: boolean;
    bag?: boolean;
    share?: boolean;
    search?: boolean;
    back?: boolean;
    settings?: boolean;
    qrcode?: boolean;
    publish?: boolean;
    scan?: boolean;
    blocked?: boolean;
    notifications?: boolean;
    delete?: boolean; // botão de excluir
    orders?: boolean;
    filter?: boolean;   // botão de filtro
    template?: boolean; // novo botão de Template
  };
  handleBack?: () => void;
  onFilter?: () => void;      // callback para o botão de filtro
  handleTemplate?: () => void;  // callback para o botão de Template
  showLogo?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  onDelete?: () => void;      // ação ao clicar em deletar
}
