export interface ChannelDTO {
    name: string;
    description?: string;
    visibility?: boolean;
}
  
export interface ChannelData {
    id: string;
    name: string;
    nickname: string;
    biography?: string;
    externalLink?: string;
    visibility?: boolean;
    isActive?: boolean;
    imageUrl?: string; 
}

export interface FollowerData {
    id: string;
    name?: string;
    nickname: string;
    profileImage?: string;
}

export interface FollowingChannelData {
    id: string;
    name: string;
    nickname: string;
    imageUrl?: string;
    visibility: boolean;
}

export interface AboutData {
    id: string;
    content: string;
    aboutText: string;
    storePolicies: string;
    exchangesAndReturns: string;
    additionalInfo: string;
}

export interface FAQData {
    question: string;
    answer: string;
}
  
 
export interface AboutDTO {
    title: string;
    content: string;
    channelId?: string; 
    aboutText?: string; 
    storePolicies?: string;
    exchangesAndReturns?: string;
    additionalInfo?: string;
}
  
  
export interface AboutData {
    id: string;
    title: string;
    content: string;
    channelId: string;
}
  
export interface FAQDTO {
    question: string;
    answer: string;
    aboutId: string;
}
  
export interface FAQData {
    id: string;
    question: string;
    answer: string;
    aboutId: string;
}
  
export interface SimpleChannelDTO {
    id: string;
    name: string;
    imageUrl: string;
    nickname: string;
  }