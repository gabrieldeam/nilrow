export interface CustomSelectProps {
    title?: string;
    placeholder?: string;
    bottomLeftText?: string;
    bottomRightLink?: {
        href: string;
        text: string;
    } | null;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value?: string;
    name?: string;
    isValid?: boolean;
    prefix?: string;
    readOnly?: boolean;
    options: Array<{ value: string; label: string }>;
    onLoadMore?: () => void;
    hasMore?: boolean;
}