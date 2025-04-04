import React from 'react';
import { Chat } from '../../types/chatTypes';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  chatroom: Chat | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatroom }) => {
  const chatid = chatroom?.roomId;

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        {chatroom?.messages && <><div className={styles.chatName}>{`Room ${chatid}`}</div>
        <div className={styles.status}> {chatroom ? '0/2' : ''} </div></>}
      </div>
    </div>
  );
};

export default ChatHeader;
