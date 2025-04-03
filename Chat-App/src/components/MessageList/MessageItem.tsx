import React from 'react';
import { Message } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Replace 'currentUser'actual current user id
  const isOwnMessage = message.sender.id === 'currentUser';

  return (
    <div className={`${styles.messageItem} ${isOwnMessage ? styles.own : styles.other}`}>
      {!isOwnMessage && <Avatar imageUrl={message.sender.avatarUrl} size={60} />}
      <div className={styles.bubble}>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
