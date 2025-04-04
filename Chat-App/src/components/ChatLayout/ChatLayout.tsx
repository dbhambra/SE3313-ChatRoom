import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import ChatHeader from '../ChatHeader/ChatHeader.tsx';
import MessageList from '../MessageList/MessageList.tsx';
import MessageInput from '../MessageInput/MessageInput.tsx';
import { Chat } from '../../chatTypes.ts';
import styles from './ChatLayout.module.css';

const ChatLayout: React.FC = () => {

  
  const dummyChats: Chat[] = [
    {
      id: 'chat1',
      participants: [
        { id: 'currentUser', name: 'You', avatarUrl: 'https://via.placeholder.com/50' },
        { id: 'user2', name: 'Alice Winnie', avatarUrl: 'https://via.placeholder.com/50' },
      ],
      messages: [
        {
          id: 'msg1',
          text: 'Hello!',
          sender: { id: 'user2', name: 'Alice Winnie', avatarUrl: 'https://via.placeholder.com/50' },
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg2',
          text: 'Hi there!',
          sender: { id: 'currentUser', name: 'You', avatarUrl: 'https://via.placeholder.com/50' },
          timestamp: new Date().toISOString(),
        },
      ],
      status: 1
    },
    {
      id: 'chat2',
      participants: [
        { id: 'currentUser', name: 'You', avatarUrl: 'https://via.placeholder.com/50' },
        { id: 'user3', name: 'Josh Roland', avatarUrl: 'https://via.placeholder.com/51' },
      ],
      messages: [],
      status: 0
    }
  ];

  const messages: Chat[] = [];

  const [selectedChat, setSelectedChat] = useState<Chat | null>(messages[0]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className={styles.container}>
      <Sidebar chats={dummyChats} onSelectChat={handleSelectChat} />
      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} />
            <MessageList chat={selectedChat} />
            <MessageInput chatId={selectedChat.id} />
          </>
        ) : (
          <div className={styles.placeholder}>Select a chat to start messaging</div>
          
        )}
      </div>
    </div>
  );
};

const handleServerMessage = (raw: string) => {
  const [type, payload] = raw.split(';');

  switch (type) {
    case '1':
      console.log('[Server] Message received:', payload);
      // TODO: Append to message list
      break;
    case '2':
      console.log('[Server] Successfully joined room:', payload);
      break;
    case '3':
      alert('[Server] Room full.');
      break;
    // ... handle other cases (4–10)
    default:
      console.log('[Server] Unknown type:', type);
  }
};

const send = useWebSocket('ws://localhost:8080', handleServerMessage);

export default ChatLayout;
