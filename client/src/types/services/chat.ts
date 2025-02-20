export interface MessageContent {
    content: string;
  }
  
  export interface MessageData {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    seen: boolean;
    contentType?: string;
    isSender?: boolean;
    sentAt: string;    
    senderType: string; 
  }

  export interface MessageDataDTO {
    id: string;
    content: string;
    senderType: string; 
    seen: boolean;
    isSender?: boolean;
    sentAt: string;
    contentType?: "text" | "image" | "file" | string;
  }

  export interface UIBasicConversation {
    id: string; 
    name: string;
    imageUrl?: string;
    nickname?: string;
    isBlocked?: boolean;
    newMessagesCount?: number;
    lastMessage?: MessageData;
    lastMessageTime?: string;
  }

  export type BlockStatus = boolean;
  
  export interface ChannelData {
    id: string;
    name: string;
  }  

  export interface ConversationChannelDTO {
    conversationId: string;
    channelId: string;
    name: string;
    imageUrl: string;
    nickname: string;
  }
  
  export interface ConversationPeopleDTO {
    conversationId: string;
    peopleId: string;
    name: string;
    nickname: string;
  }
