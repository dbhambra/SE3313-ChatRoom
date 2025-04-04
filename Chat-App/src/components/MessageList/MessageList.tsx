import React, { useEffect, useRef } from 'react';
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

  return (
    <div className={styles.messageList}>
      {chatroom?.messages?.map((message, index ) => <MessageItem key={`${message}${index}`} message={message} />)}
  
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
