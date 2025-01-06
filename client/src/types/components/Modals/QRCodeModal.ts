export interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    nickname: string;
    imageUrl?: string;
  }
  