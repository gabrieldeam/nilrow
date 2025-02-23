export interface PagedResponse<T> {
    content: T[];
    totalPages: number; 
    totalElements: number;
    size: number;
    number: number; 
    first: boolean;
    last: boolean;
    empty: boolean;
  }
  