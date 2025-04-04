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

  // Handle incoming WebSocket messages
  const handleServerMessage = (msg: { type: string; payload: string }) => {
    const {type, payload} = msg;
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
      case '4':
        console.log('[Server] Room status:', payload === '0' ? 'Full' : 'Available');
        break;
      case '5':
        console.log('[Server] Successfully left room');
        break;
      case '6':
        console.log('[Server] Someone left the room:', payload);
        break;
      case '9':
        console.log('[Server] Incoming request from client:', payload);
        break;
      case '10':
        console.log('[Server] Waiting for other client to accept:', payload);
        break;
      default:
        console.log('[Server] Unknown type:', payload);
    }
  };

    // Connect to WebSocket after username is set
    const { send } = useWebSocket(username ? 'ws://localhost:8080' : null, handleServerMessage);
    
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
    {
      roomId: 2,
      messages: [
        {
          text: 'Lets go tomorrow to the party.',
          nameId: 'Xavier',
          timestamp: new Date().toISOString(),
        },
        {
          text: 'Nah, ima just stay home lol',
          nameId: 'Tahama',
          timestamp: new Date().toISOString(),
        },
        {
          text: 'Suit yourself :/',
          nameId: 'Xavier',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const sendToServer = (send: (msg: string) => void, code: number, payload?: string) => {
    const message = payload !== undefined ? `${code};${payload}` : `${code};`;
    send(message);
    console.log('Sent:', message);
  };

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
  
    setTimeout(() => {
      sendToServer(send, 2, name);
    }, 100);
  };
  

  return (
    <div className={styles.container}>
      {!username && <UsernameModal onSubmit={handleUsernameSubmit} />}
      {username && (
        <>
          <Sidebar chatrooms={dummyChats} onSelectChat={handleSelectChat} />
          <div className={styles.chatArea}>
            <ChatHeader chatroom={selectedChat} />
            <MessageList chatroom={selectedChat} />
            <MessageInput chatId={selectedChat?.roomId} />  
          </div>
        </>
      )}
    </div>
  );
};

export default ChatLayout;
