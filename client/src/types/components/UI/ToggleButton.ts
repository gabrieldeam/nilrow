export interface ToggleButtonProps {
    initial?: boolean; // Estado inicial, opcional
    onToggle: (state: boolean) => void; // Função chamada ao alternar
  }
  