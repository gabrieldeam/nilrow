export interface Channel {
    id: string;
    name: string;
    nickname: string;
    imageUrl?: string;
  }
  
  export interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  