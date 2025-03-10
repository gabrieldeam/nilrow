export interface IModalTemplateProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (templateId: string) => void;
  }
  