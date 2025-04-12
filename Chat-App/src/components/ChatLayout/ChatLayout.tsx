import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar/Sidebar.tsx';
import ChatHeader from '../ChatHeader/ChatHeader.tsx';
import MessageList from '../MessageList/MessageList.tsx';
import MessageInput from '../MessageInput/MessageInput.tsx';
import UsernameModal from '../UsernameModal/UsernameModal.tsx';
import useWebSocket from '../hooks/useWebSocket.tsx';
import { Chat, Message } from '../../types/chatTypes.ts';
import styles from './ChatLayout.module.css';

const ChatLayout: React.FC = () => {

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const [username, setUsername] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<boolean>(false);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const [isRoomFull, setIsRoomFull] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
  });
  
  const [pendingRoom, setPendingRoom] = useState<Chat | null>(null);
  const [chatrooms, setChatrooms] = useState<Chat[]>([
    {
      roomId: 1,
      messages: [
      ],
    },
    {
      roomId: 2,
      messages: [],
    },
    {
      roomId: 3,
      messages: [],
    },
  ]);


  useEffect(() => {
    const cached = localStorage.getItem("chatrooms");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
  
        // Add divider only if there are past conversations in the chatroom
        const updated = parsed.map(chat => {
          if (chat.messages.length > 0) {
            // Get the timestamp of the last message
            const lastMessageTimestamp = chat.messages[chat.messages.length - 1].timestamp;
  
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  nameId: null,
                  text: 'divider',
                  timestamp: lastMessageTimestamp, // Set divider timestamp to last message's timestamp
                }
              ]
            };
          }
          return chat;
        });
  
        setChatrooms(updated);
      } catch (err) {
        console.error("Failed to parse cached chatrooms:", err);
      }
    }
  }, []);
  


  // Create a ref to hold the latest selectedChat value
  const selectedChatRef = useRef(selectedChat);
  const pendingRoomRef = useRef<Chat | null>(null);


  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  
  useEffect(() => {
   console.log(isRoomFull)
  }, [isRoomFull]);

  const handleServerMessage = (msg: { type: string; payload: string }) => {
    const { type, payload } = msg;

    switch (type) {
      case '1':
        break;

      case '2':
        console.log('[Server] Successfully joined room:', payload);
        if (pendingRoomRef.current) {
          setSelectedChat(pendingRoomRef.current);
          pendingRoomRef.current = null;
        }
        break;
        

      case '3':
        console.log('[Server] Room full.');
        if (pendingRoomRef.current) {
          const roomId = pendingRoomRef.current.roomId;
          setIsRoomFull(prev => ({
            ...prev,
            [roomId]: true,
          }));
          pendingRoomRef.current = null; // clear pending since the join was rejected
        }
        break;
      

      case '5':
        console.log('[Server] Successfully left room');
        break;

      case '6': {
        console.log('[Server] Someone left the room:', payload);
        const roomId = parseInt(payload);
        setIsRoomFull(prev => ({ ...prev, [roomId]: false }));
        break;
}

      case '9':
        console.log('[Server] Incoming request from client:', payload);
        break;

      case '10':
        console.log('[Server] Waiting for other client to accept:', payload);
        break;

      case '20':
        console.log('[Server]: ', payload)
        setUsername(null);
        setUsernameError(true);
        break;

      case '21':
        console.log('[Server]: ', payload)
        setUsernameError(false);
        break;

      default:
        if (type) {
  
        const [nameId, ...rest] = type.split(":");
        const text = rest.join(":"); // supports messages with additional colons

        if(text && nameId){

          const newMessage: Message = {
            text,
            nameId,
            timestamp: new Date().toISOString(),
          };
  
          setChatrooms((prevChats) => {
            return prevChats.map((chat) =>
              chat.roomId === selectedChatRef.current?.roomId
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
            );
          });

        }

        } else {
          console.log('[Server] Unknown type:', payload);
        }
      }
  };

  const { send } = useWebSocket(username ? 'ws://localhost:8080' : null, handleServerMessage);

  const sendToServer = (send: (msg: string) => void, code: number, payload?: string) => {
    const message = payload !== undefined ? `${code};${payload}` : `${code};`;
    send(message);
    //console.log('Sent:', message);
  };

  const handleSelectChat = (chat: Chat) => {
    pendingRoomRef.current = chat;
    setTimeout(() => {
      sendToServer(send, 4, `${chat.roomId + 1}`);
    }, 100);
  };
  
  

  const handleSendMessage = (message: string) => {
    setTimeout(() => {
      sendToServer(send, 1, message);
    }, 100);
  };

  const handleUsernameSubmit = async(name: string) => {
    setTimeout(() => {
      sendToServer(send, 2, name);
    }, 100);
    setUsername(name.trim());
    await delay(5000);
  };

  useEffect(() => {
    if (selectedChat) {
      const updatedChat = chatrooms.find(chat => chat.roomId === selectedChat.roomId);
      if (updatedChat && updatedChat !== selectedChat) {
        setSelectedChat(updatedChat);
        localStorage.setItem("chatrooms", JSON.stringify(chatrooms));
      }
    }

  }, [chatrooms, selectedChat]);


  return (
    <div className={styles.container}>
      {!username && <UsernameModal error={usernameError} onSubmit={handleUsernameSubmit} />}
      {username && (
        <>
          <Sidebar chatrooms={chatrooms} onSelectChat={handleSelectChat} isRoomFull={isRoomFull} />
          <div className={styles.chatArea}>
            <ChatHeader chatroom={selectedChat} />
            <MessageList chatroom={selectedChat} username={username} />
            <MessageInput chatId={selectedChat?.roomId} handleSendMessage={handleSendMessage} send={send} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatLayout;
