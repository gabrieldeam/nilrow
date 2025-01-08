export interface HomeSubHeaderProps {
    onSectionChange: (section: string) => void;
    activeSection: string;
    selectedCategory?: string | null;
    selectedSubCategory?: string;
    onMoreClick: () => void;
  }