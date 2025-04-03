import React from 'react';
import { Chat } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './SidebarItem.module.css';
import { ChatStatus } from '../../constants/constants.tsx';


interface SidebarItemProps {
  chat: Chat;
  onSelect: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ chat, onSelect }) => {
  const chatName = chat.participants && chat.participants[1].name;
  const status = ChatStatus[chat.status];

  
const onSelectLocal = () => {

  onSelect();
}

  return (
    <div className={styles.item} onClick={onSelectLocal}>
      <Avatar imageUrl={chat.participants ? chat.participants[0].avatarUrl : undefined} size={50} />
      <div className={styles.info}>
        <div className={styles.name}>{chatName}</div>
        <div className={chat.status === 0 ? styles.status_open : styles.status_chatting }>{status}</div>
      </div>
    </div>
  );
};

export default SidebarItem;
