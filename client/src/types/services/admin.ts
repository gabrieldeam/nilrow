export interface UserData {
    id: string;
    nickname: string;
    email: string;
    role: string;
  }
  
  export interface ChannelData {
    id: string;
    name: string;
    ownerId: string;
  }
  
  export interface CatalogData {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
  }
  