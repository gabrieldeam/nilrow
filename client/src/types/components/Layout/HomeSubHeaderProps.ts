export interface HomeSubHeaderProps {
    onSectionChange: (section: string) => void;
    activeSection: string;
    selectedCategory?: string;
    selectedSubCategory?: string;
    onMoreClick: () => void;
  }