// @ts-nocheck
import React from 'react';
import { Chat } from '../../types/chatTypes';
import styles from './ChatHeader.module.css';
import { MdGroups } from "react-icons/md";

interface ChatHeaderProps {
  chatroom: Chat | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatroom }) => {
  const chatid = chatroom?.roomId;

  return (
    <div className={styles.header}>
      <MdGroups className={styles.icon} />
      <div className={styles.info}>
        {chatroom?.messages && (
          <>
            <div className={styles.chatName}>{`Room ${chatid}`}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
