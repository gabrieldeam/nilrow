export interface MessageContent {
    content: string;
  }
  
  export interface MessageData {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    seen: boolean;
  }
  
  export interface ConversationData {
    id: string;
    participants: string[];
    lastMessage: MessageData;
    isMuted: boolean;
  }
  
  export interface ChannelData {
    id: string;
    name: string;
  }
  
  export interface BlockStatus {
    isBlocked: boolean;
    blockedBy: string | null;
  }
  