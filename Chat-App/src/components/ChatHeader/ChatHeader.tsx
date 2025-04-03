import React from 'react';
import { Chat } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './ChatHeader.module.css';
import { ChatStatus } from '../../constants/constants.tsx';

interface ChatHeaderProps {
  chat: Chat;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  const chatName = chat.participants[1].name;
  const status = ChatStatus[chat.status]

  return (
    <div className={styles.header}>
      <Avatar imageUrl={chat.participants[0].avatarUrl} size={50} />
      <div className={styles.info}>
        <div className={styles.chatName}>{chatName}</div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
};

export default ChatHeader;
