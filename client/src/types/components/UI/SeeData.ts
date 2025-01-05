import { CSSProperties } from 'react';

export interface SeeDataProps {
  title: string;
  content: string;
  subContent?: string;
  link?: string;
  linkText?: string;
  onClick?: () => void;
  stackContent?: boolean;
  showToggleButton?: boolean;
  onToggle?: (state: boolean) => void;
  toggled?: boolean;
  showIcon?: boolean;
  badgeText?: string;
  badgeBackgroundColor?: CSSProperties['backgroundColor'];
}
