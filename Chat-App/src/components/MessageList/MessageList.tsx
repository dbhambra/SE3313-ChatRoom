import React, { useEffect, useRef } from 'react';
import { Chat } from '../../types/chatTypes';
import MessageItem from './MessageItem.tsx';
import styles from './MessageList.module.css';

interface MessageListProps {
  chat: Chat;
}

const MessageList: React.FC<MessageListProps> = ({ chat }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  return (
    <div className={styles.messageList}>
      {chat.messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
