import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import ChatHeader from '../ChatHeader/ChatHeader.tsx';
import MessageList from '../MessageList/MessageList.tsx';
import MessageInput from '../MessageInput/MessageInput.tsx';
import UsernameModal from '../UsernameModal/UsernameModal.tsx';
import useWebSocket from '../hooks/useWebSocket.tsx';
import { Chat } from '../../types/chatTypes.ts';
import styles from './ChatLayout.module.css';


const ChatLayout: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
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

  // Handle incoming WebSocket messages
  const handleServerMessage = (raw: string) => {
    const [type, payload] = raw.split(';');
    switch (type) {
      case '1':
        console.log('[Server] Message received:', payload);
        break;
      case '2':
        console.log('[Server] Successfully joined room:', payload);
        break;
      case '3':
        alert('[Server] Room full.');
        break;
      default:
        console.log('[Server] Unknown type:', type);
    }
  };

  // Connect to WebSocket after username is set
  const send = useWebSocket(username ? 'ws://localhost:8080' : null, handleServerMessage);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    // Optionally: send `2;<username>` to server
    setTimeout(() => {
      send?.(`2;${name}`);
    }, 100);
  };

  return (
    <div className={styles.container}>
      {!username && <UsernameModal onSubmit={handleUsernameSubmit} />}
      {username && (
        <>
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
        </>
      )}
    </div>
  );
};

export default ChatLayout;
