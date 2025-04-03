export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
  }
  
  export interface Message {
    id: string;
    text: string;
    sender: User;
    timestamp: string;
  }
  
  export interface Chat {
    id: string;
    participants: User[];
    status: number; 
    messages: Message[];
  }