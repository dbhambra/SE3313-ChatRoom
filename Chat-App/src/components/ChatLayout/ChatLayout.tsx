import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import ChatHeader from '../ChatHeader/ChatHeader.tsx';
import MessageList from '../MessageList/MessageList.tsx';
import MessageInput from '../MessageInput/MessageInput.tsx';
import UsernameModal from '../UsernameModal/UsernameModal.tsx';
import useWebSocket from '../hooks/useWebSocket.tsx';
import { Chat, Message } from '../../types/chatTypes.ts';
import styles from './ChatLayout.module.css';

const ChatLayout: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatrooms, setChatrooms] = useState<Chat[]>([]);

  const handleServerMessage = (msg: { type: string; payload: string }) => {
    const { type, payload } = msg;

    switch (type) {
      case '1':
        if (!selectedChat) return;

        const newMessage: Message = {
          text: payload,
          nameId: 'Server',
          timestamp: new Date().toISOString(),
        };

        setChatrooms(prevChats =>
          prevChats.map(chat =>
            chat.roomId === selectedChat.roomId
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
        );
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

  const { send } = useWebSocket(username ? 'ws://localhost:8080' : null, handleServerMessage);

  const sendToServer = (send: (msg: string) => void, code: number, payload?: string) => {
    const message = payload !== undefined ? `${code};${payload}` : `${code};`;
    send(message);
    console.log('Sent:', message);
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setTimeout(() => {
      sendToServer(send, 4, `${chat.roomId + 1}`);
    }, 100);
  };

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    setChatrooms([
      {
        roomId: 0,
        messages: [],
      },
      {
        roomId: 1,
        messages: [],
      },
      {
        roomId: 2,
        messages: [],
      },
    ]);

    setTimeout(() => {
      sendToServer(send, 2, name);
    }, 100);
  };

  // Periodically send 5;roomId every 3 seconds
  useEffect(() => {
    if (!username || chatrooms.length === 0) return;

    const interval = setInterval(() => {
      chatrooms.forEach(chat => {
        sendToServer(send, 5, `${chat.roomId}`);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [username, chatrooms, send]);

  return (
    <div className={styles.container}>
      {!username && <UsernameModal onSubmit={handleUsernameSubmit} />}
      {username && (
        <>
          <Sidebar chatrooms={chatrooms} onSelectChat={handleSelectChat} />
          <div className={styles.chatArea}>
            <ChatHeader chatroom={selectedChat} />
            <MessageList chatroom={selectedChat} />
            <MessageInput chatId={selectedChat?.roomId} send={send}/>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatLayout;
