import React from 'react';
import SidebarItem from './SidebarItem.tsx';
import { Chat } from '../../types/chatTypes';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, onSelectChat }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>Chats</div>
      <div className={styles.chatList}>
        {chats.map((chat) => (
          <SidebarItem key={chat.id} chat={chat} onSelect={() => onSelectChat(chat)} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
