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
    };
    handleBack?: () => void;
    showLogo?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit?: (e: React.FormEvent) => void;
    onDelete?: () => void; // ação ao clicar em deletar
  }
  