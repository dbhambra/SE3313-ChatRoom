import React from "react";
import { Message } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
  avatarColor: string;
  username: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, avatarColor, username }) => {
  // Check if this is a divider message
  const isDivider = message.nameId === null && message.text === 'divider';

  function formatTimestamp(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return (new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)).toUpperCase();
  }

  if (isDivider) {
    return <div className={styles.divider}>{`─── CHAT HISTORY FROM ${formatTimestamp(message.timestamp)} ───`}</div>;
  }

  const isOwnMessage = message.nameId === username;

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
