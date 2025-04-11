import React, { useEffect, useRef, useState } from 'react';
import { Chat } from '../../types/chatTypes';
import MessageItem from './MessageItem.tsx';
import styles from './MessageList.module.css';

interface MessageListProps {
  chatroom: Chat | null;
}

const MessageList: React.FC<MessageListProps> = ({ chatroom }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatroom?.messages]);

  const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const [bgColor, setBgColor] = useState<string>("");

  useEffect(() => {
    setBgColor(getRandomColor());
  }, [chatroom?.roomId]);


  return (
    <div className={styles.messageList}>
      {chatroom?.messages?.map((message, index ) => <MessageItem key={`${message}${index}`} avatarColor={bgColor} message={message} />)}
  
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
