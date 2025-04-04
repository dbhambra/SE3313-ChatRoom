import React from 'react';
import { Chat } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  chatroom: Chat;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatroom }) => {
  const chatid = chatroom.roomId;

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        {chatroom.messages && <><div className={styles.chatName}>{`Room ${chatid}`}</div>
        <div className={styles.status}> 0/2 </div></>}
      </div>
    </div>
  );
};

export default ChatHeader;
