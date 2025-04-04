import React, { useState, useEffect } from "react";
import { Message } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
  avatarColor: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, avatarColor }) => {
  // Replace 'currentUser'actual current user id
  const isOwnMessage = message.nameId === 'Tahama';

  return (
    <div className={`${styles.messageItem} ${isOwnMessage ? styles.own : styles.other}`}>
      {!isOwnMessage && <Avatar bgColor={avatarColor} username={message.nameId} />}
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
