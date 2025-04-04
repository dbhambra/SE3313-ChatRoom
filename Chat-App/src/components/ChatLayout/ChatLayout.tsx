import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import ChatHeader from '../ChatHeader/ChatHeader.tsx';
import MessageList from '../MessageList/MessageList.tsx';
import MessageInput from '../MessageInput/MessageInput.tsx';
import UsernameModal from '../UsernameModal/UsernameModal.tsx';
import useWebSocket from '../hooks/useWebSocket.tsx';
import { Chat } from '../../types/chatTypes.ts';
import styles from './ChatLayout.module.css';
import useWebSocket from '../hooks/useWebSocket.tsx';




const send = useWebSocket('ws://localhost:8080', handleServerMessage);

const ChatLayout: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  
  const dummyChats: Chat[] = [
    {
      roomId: 0,
      messages: [
        {
          text: 'Hello!',
          nameId: 'Alice',
          timestamp: new Date().toISOString(),
        },
        {
          text: 'Hi there!',
          nameId: 'Tahama',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      roomId: 1,
      messages: [
        {
          text: 'I am really Hungry!',
          nameId: 'Justin',
          timestamp: new Date().toISOString(),
        },
        {
          text: 'Me too! Pizza?',
          nameId: 'Tahama',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];

  const [selectedChat, setSelectedChat] = useState<Chat | null>(dummyChats);

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
      <Sidebar chatrooms={dummyChats} onSelectChat={handleSelectChat} />
      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <ChatHeader chatroom={selectedChat} />
            <MessageList chatroom={selectedChat} />
            <MessageInput chatId={selectedChat.roomId} />
          </>
        ) : (
          <div className={styles.placeholder}>Select a chat to start messaging</div>
          
        )}
      </div>
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

export default ChatLayout;
