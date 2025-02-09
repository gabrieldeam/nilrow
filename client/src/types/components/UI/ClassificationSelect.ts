export interface ClassificationData {
    name: string;
    value: string;
  }
  
  export interface ClassificationSelectProps {
    classifications: ClassificationData[];
    selectedClassification: string;
    onChange: (value: string) => void;
  }
  