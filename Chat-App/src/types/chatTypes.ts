export interface User {
    name: string;
  }
  
  export interface Message {
    nameId: string | null;
    text: string;
    timestamp: string;
  }
  
  export interface Chat {
    roomId: number;
    messages: Message[];
  }